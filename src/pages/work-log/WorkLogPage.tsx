import { useEffect, useMemo, useState } from "react";
import { formatDuration } from "../../services/formatters";
import { useWorkLogStore } from "../../stores/workLogStore";
import { PixelIcon } from "../../ui/PixelIcon";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function buildRecentDates(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - index);
    return date.toISOString().slice(0, 10);
  });
}

function formatDateLabel(date: string) {
  const [year, month, day] = date.split("-");
  return `${year}/${month}/${day}`;
}

export function WorkLogPage() {
  const report = useWorkLogStore((state) => state.report);
  const selectedDate = useWorkLogStore((state) => state.selectedDate);
  const setSelectedDate = useWorkLogStore((state) => state.setSelectedDate);
  const loadWorkLogReport = useWorkLogStore((state) => state.loadWorkLogReport);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const recentDates = useMemo(() => buildRecentDates(14), []);

  useEffect(() => {
    void loadWorkLogReport(selectedDate);
  }, [loadWorkLogReport, selectedDate]);

  const currentReport = report;
  const isToday = selectedDate === todayKey();

  function selectDate(date: string) {
    setSelectedDate(date);
    setCalendarOpen(false);
    void loadWorkLogReport(date);
  }

  return (
    <div className="cwp-page cwp-worklog-page">
      <div className="page-title-row cwp-worklog-title-row">
        <h2 className="page-title">日志</h2>
        <button
          className="cwp-worklog-date-btn"
          onClick={() => setCalendarOpen((open) => !open)}
          type="button"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <PixelIcon name="calendar" size={12} /> {formatDateLabel(selectedDate)}
        </button>
      </div>

      <section className="cwp-worklog-layout">
        <div className="cwp-worklog-score-panel">
          <div className="cwp-worklog-score-ring">
            <strong>{currentReport?.totalScore ?? 0}</strong>
            <span>/ 100</span>
          </div>
          <div className="cwp-worklog-score-copy">
            <span>{isToday ? "今日工作投入度" : "历史工作投入度"}</span>
            <p>{currentReport?.summary ?? "暂无足够数据。"}</p>
          </div>
          <div className="cwp-worklog-mini-stats">
            <div>
              <span>运行时长</span>
              <strong>{formatDuration(currentReport?.activeSeconds ?? 0)}</strong>
            </div>
            <div>
              <span>采样记录</span>
              <strong>{currentReport?.sampleCount ?? 0}</strong>
            </div>
          </div>
        </div>

        <div className="cwp-worklog-dimension-grid">
          {(currentReport?.dimensions ?? []).map((dimension) => (
            <article className="cwp-worklog-dimension-card" key={dimension.key}>
              <div className="cwp-worklog-dimension-head">
                <strong>{dimension.title}</strong>
                <span>
                  {dimension.score}/{dimension.maxScore}
                </span>
              </div>
              <div className="cwp-worklog-meter">
                <span
                  style={{
                    width: `${Math.min(
                      100,
                      (dimension.score / Math.max(1, dimension.maxScore)) * 100,
                    )}%`,
                  }}
                />
              </div>
              <em>{dimension.value}</em>
              {(dimension.facts ?? []).length > 0 && (
                <dl className="cwp-worklog-fact-grid">
                  {(dimension.facts ?? []).map((fact) => (
                    <div key={`${dimension.key}-${fact.label}`}>
                      <dt>{fact.label}</dt>
                      <dd>{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              <p>{dimension.explanation}</p>
            </article>
          ))}
        </div>
      </section>

      {calendarOpen && (
        <div className="cwp-worklog-calendar-popover">
          <div className="cwp-worklog-calendar-head">
            <span>选择日志日期</span>
            <button onClick={() => setCalendarOpen(false)} type="button">
              ×
            </button>
          </div>
          <input
            className="cwp-worklog-date-input"
            max={todayKey()}
            onChange={(event) => selectDate(event.target.value)}
            type="date"
            value={selectedDate}
          />
          <div className="cwp-worklog-date-grid">
            {recentDates.map((date) => (
              <button
                className={date === selectedDate ? "is-active" : ""}
                key={date}
                onClick={() => selectDate(date)}
                type="button"
              >
                {formatDateLabel(date)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
