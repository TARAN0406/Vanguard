import { ChatGroq } from "@langchain/groq";
import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

// We define our State
const GraphState = Annotation.Root({
  employee: Annotation(),
  events: Annotation(),
  analystNotes: Annotation(),
  complianceNotes: Annotation(),
  finalReport: Annotation(),
  actionTaken: Annotation()
});

// Setup Model
let llm = null;

const getLLM = () => {
  if (llm) return llm;
  if (process.env.GROQ_API_KEY) {
    llm = new ChatGroq({
      model: "llama-3.3-70b-versatile",
      apiKey: process.env.GROQ_API_KEY,
      temperature: 0.2
    });
  }
  return llm;
};

// Node 1: Analyst Agent
const forensicAnalystNode = async (state) => {
  const currentLlm = getLLM();
  if (!currentLlm) return { analystNotes: "LLM Offline." };
  
  const prompt = `You are a Tier-3 Cyber Forensic Analyst. Look at these access events and the employee context, and output a strict technical breakdown of the anomaly. Identify specific MITRE ATT&CK techniques in your notes.
  
Employee Context: ${JSON.stringify(state.employee)}
Access Events: ${JSON.stringify(state.events)}
  
Output your technical notes only.`;

  const response = await currentLlm.invoke(prompt);
  return { analystNotes: response.content };
};

// Node 2: Compliance Agent
const complianceNode = async (state) => {
  const currentLlm = getLLM();
  if (!currentLlm) return { complianceNotes: "LLM Offline." };
  
  const prompt = `You are a Bank Compliance Officer. Review the forensic analyst's notes and map the findings to regulatory violations (e.g. RBI Master Direction IT 2023, CERT-In). 
  
Analyst Notes: ${state.analystNotes}
  
Output your regulatory compliance notes only.`;

  const response = await currentLlm.invoke(prompt);
  return { complianceNotes: response.content };
};

// Node 3: Executive Summarizer Agent
const executiveSummarizerNode = async (state) => {
  const currentLlm = getLLM();
  if (!currentLlm) return { finalReport: _generateFallbackReport(state.employee, state.events) };
  
  const prompt = `You are a Senior Security Executive. Combine the forensic analyst's technical notes and the compliance officer's regulatory notes into a single cohesive incident report.
You MUST output EXACTLY three sections:
### 1. What Happened
### 2. Why it is Suspicious
### 3. Recommended Actions

Analyst Notes: ${state.analystNotes}
Compliance Notes: ${state.complianceNotes}
  
Keep it strictly professional and concise. Do not output anything outside of the 3 sections.`;

  const response = await currentLlm.invoke(prompt);
  return { finalReport: response.content };
};

// ---------------------------------------------------------
// NEW: AUTONOMOUS SOAR TOOL CALLING
// ---------------------------------------------------------

const suspendAccountTool = tool(
  async ({ employee_id }) => {
    try {
      const res = await fetch(`http://localhost:5000/api/freeze/${employee_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frozen_by: "Autonomous AI Agent" })
      });
      return await res.json();
    } catch (e) {
      return { error: e.message };
    }
  },
  {
    name: "suspend_account",
    description: "Instantly suspends an employee's access to the network. Call this ONLY if the employee is a critical threat with a score of 100.",
    schema: z.object({
      employee_id: z.string().describe("The exact ID of the employee to suspend (e.g. EMP_STAGE)")
    })
  }
);

// Node 4: Active Response Agent (Tool Caller)
const activeResponseNode = async (state) => {
  const currentLlm = getLLM();
  if (!currentLlm) return { actionTaken: false };

  const boundLlm = currentLlm.bindTools([suspendAccountTool]);

  const prompt = `You are an Autonomous Active Response Agent. 
Look at the employee context:
ID: ${state.employee.id}
Risk Score: ${state.employee.riskScore}
Status: ${state.employee.status}

Read the final incident report:
${state.finalReport}

If the risk score is 100 AND the status is not already 'Suspended', you MUST call the 'suspend_account' tool using the exact employee ID. 
Otherwise, do nothing.`;

  const response = await boundLlm.invoke(prompt);

  // Check if the LLM decided to call a tool
  if (response.tool_calls && response.tool_calls.length > 0) {
    const toolCall = response.tool_calls[0];
    if (toolCall.name === "suspend_account") {
      await suspendAccountTool.invoke(toolCall.args);
      return { actionTaken: true, finalReport: state.finalReport + "\n\n> [!CAUTION]\n> **SOAR ACTION TAKEN:** The Autonomous Active Response Agent has automatically executed the `suspend_account` protocol based on the severity of this threat." };
    }
  }

  return { actionTaken: false };
};

// Compile the Graph
const workflow = new StateGraph(GraphState)
  .addNode("analyst", forensicAnalystNode)
  .addNode("compliance", complianceNode)
  .addNode("summarizer", executiveSummarizerNode)
  .addNode("active_response", activeResponseNode)
  .addEdge(START, "analyst")
  .addEdge("analyst", "compliance")
  .addEdge("compliance", "summarizer")
  .addEdge("summarizer", "active_response")
  .addEdge("active_response", END);

const app = workflow.compile();

export const generateIncidentReport = async (employee, events) => {
  const fallbackMode = !getLLM();
  if (fallbackMode) return _generateFallbackReport(employee, events);

  try {
    const finalState = await app.invoke({
      employee,
      events,
      analystNotes: "",
      complianceNotes: "",
      finalReport: "",
      actionTaken: false
    });
    return finalState.finalReport;
  } catch (error) {
    console.error("LangGraph API Error:", error);
    return _generateFallbackReport(employee, events);
  }
};

const _generateFallbackReport = (employee, events) => {
  const isHighRisk = employee.riskScore > 50;
  
  return `### 1. What Happened
Employee ${employee.name} (${employee.role}) generated a risk score of ${employee.riskScore}/100.
${events.length > 0 ? `Recent event noted: ${events[0].action} at ${events[0].timestamp}.` : 'No recent events recorded.'}

### 2. Why it is Suspicious
This behavior triggered ${employee.mitreTags.length} MITRE ATT&CK techniques, including ${employee.mitreTags.join(', ') || 'anomalous access patterns'}. ${isHighRisk ? 'The severity indicates a strong deviation from normal operational baselines.' : 'The actions represent a minor deviation.'}

### 3. Recommended Actions
1. ${isHighRisk ? 'Freeze employee account immediately pending SOC review.' : 'Continue monitoring the employee account.'}
2. Notify the CISO and direct supervisor.
3. Preserve all access logs for audit per ${employee.complianceTags.join(', ') || 'internal policy'}.`;
};
