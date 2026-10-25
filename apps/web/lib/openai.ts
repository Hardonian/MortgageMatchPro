export * from '../../../core/openai';
export {
  AffordabilityAgent,
  RateIntelligenceAgent,
  ScenarioAnalysisAgent,
  LeadRoutingAgent,
  MonetizationAgent,
  openai,
} from '../../../core/openai';
import { openai } from '../../../core/openai';
export function getOpenAI() { return openai; }
export default openai;

