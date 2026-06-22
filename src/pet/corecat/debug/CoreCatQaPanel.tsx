import type { CoreCatAnimationState } from "../animation/animationTypes";
import type { CoreCatQaSequenceId } from "./coreCatQaSequences";
import { CORE_CAT_QA_SEQUENCES } from "./coreCatQaSequences";

export type CoreCatQaStepStatus =
  | "pending"
  | "running"
  | "passed"
  | "warning"
  | "failed";

export interface CoreCatQaStepResult {
  note: string;
  state: CoreCatAnimationState;
  status: CoreCatQaStepStatus;
}

export interface CoreCatQaRunState {
  cleanupOk: boolean | null;
  isRunning: boolean;
  sequenceId: CoreCatQaSequenceId | null;
  stuckState: CoreCatAnimationState | null;
  steps: CoreCatQaStepResult[];
}

export function CoreCatQaPanel({
  run,
  onRun,
  onStop,
}: {
  run: CoreCatQaRunState;
  onRun: (id: CoreCatQaSequenceId) => void;
  onStop: () => void;
}) {
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <aside className="corecat-qa-panel">
      <header>
        <strong>CoreCat QA</strong>
        {run.isRunning ? (
          <button onClick={onStop} type="button">
            Stop
          </button>
        ) : null}
      </header>

      <div className="corecat-qa-actions">
        {Object.values(CORE_CAT_QA_SEQUENCES).map((sequence) => (
          <button
            disabled={run.isRunning}
            key={sequence.id}
            onClick={() => onRun(sequence.id)}
            type="button"
          >
            {sequence.label}
          </button>
        ))}
      </div>

      <dl>
        <div>
          <dt>Sequence</dt>
          <dd>{run.sequenceId ?? "idle"}</dd>
        </div>
        <div>
          <dt>Stuck</dt>
          <dd>{run.stuckState ?? "none"}</dd>
        </div>
        <div>
          <dt>VFX Clean</dt>
          <dd>
            {run.cleanupOk == null ? "-" : run.cleanupOk ? "ok" : "blocked"}
          </dd>
        </div>
      </dl>

      <ol>
        {run.steps.length > 0 ? (
          run.steps.map((step, index) => (
            <li className={`is-${step.status}`} key={`${step.state}-${index}`}>
              <span>{step.state}</span>
              <small>{step.note}</small>
            </li>
          ))
        ) : (
          <li className="is-empty">No QA run yet</li>
        )}
      </ol>
    </aside>
  );
}
