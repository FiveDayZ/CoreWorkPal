import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type {
  AssessmentInsight,
  DailyWorkAssessment,
  DailyWorkAssessmentSummary,
  DailyWorkAssessmentTrend,
  WorkTimelineSegment,
} from "../../types/dailyWorkAssessment";
import type { WorkLogReport } from "../../types/workLog";
import { formatDuration } from "../../services/formatters";
import { useWorkLogStore } from "../../stores/workLogStore";
import { PixelIcon, type PixelIconName } from "../../ui/PixelIcon";
import { WorkProfileAvatar } from "../../components/WorkProfileAvatar";

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

type WorkLogTab =
  | "overview"
  | "history"
  | "trend"
  | "workprint"
  | "timeline"
  | "insights"
  | "dimensions";

const workLogTabs: Array<{ id: WorkLogTab; label: string }> = [
  { id: "overview", label: "概览" },
  { id: "history", label: "历史" },
  { id: "trend", label: "趋势" },
  { id: "workprint", label: "指纹" },
  { id: "timeline", label: "时间线" },
  { id: "insights", label: "洞察" },
  { id: "dimensions", label: "五维" },
];

export function WorkLogPage() {
  const report = useWorkLogStore((state) => state.report);
  const assessment = useWorkLogStore((state) => state.assessment);
  const assessmentHistory = useWorkLogStore((state) => state.assessmentHistory);
  const assessmentTrend = useWorkLogStore((state) => state.assessmentTrend);
  const selectedDate = useWorkLogStore((state) => state.selectedDate);
  const setSelectedDate = useWorkLogStore((state) => state.setSelectedDate);
  const loadAssessmentHistory = useWorkLogStore(
    (state) => state.loadAssessmentHistory,
  );
  const loadAssessmentTrend = useWorkLogStore((state) => state.loadAssessmentTrend);
  const loadWorkLogReport = useWorkLogStore((state) => state.loadWorkLogReport);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<WorkLogTab>("overview");
  const recentDates = useMemo(() => buildRecentDates(14), []);

  useEffect(() => {
    void loadWorkLogReport(selectedDate);
  }, [loadWorkLogReport, selectedDate]);

  useEffect(() => {
    void loadAssessmentHistory(14);
    void loadAssessmentTrend(14);
  }, [loadAssessmentHistory, loadAssessmentTrend]);

  const currentReport = report;
  const currentAssessment = assessment;
  const isToday = selectedDate === todayKey();

  function selectDate(date: string) {
    setSelectedDate(date);
    setCalendarOpen(false);
  }

  return (
    <div className="cwp-page cwp-worklog-page">
      <div className="page-title-row cwp-worklog-title-row">
        <h2 className="page-title">每日工况报告</h2>
        <button
          className="cwp-worklog-date-btn"
          onClick={() => setCalendarOpen((open) => !open)}
          type="button"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <PixelIcon name="calendar" size={12} /> {formatDateLabel(selectedDate)}
        </button>
      </div>

      <nav className="cwp-worklog-tabs" aria-label="每日工况报告模块切换">
        {workLogTabs.map((tab) => (
          <button
            className={activeTab === tab.id ? "is-active" : ""}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="cwp-worklog-tab-panel">
        {activeTab === "overview" && (
          <>
            <DailyReportHero
              assessment={currentAssessment}
              isToday={isToday}
              report={currentReport}
            />
            <WorkprintAndBaseline
              assessment={currentAssessment}
            />
          </>
        )}

        {activeTab === "history" && (
          <section className="cwp-history-card-wall">
            <div className="cwp-section-title">
              <PixelIcon name="calendar" size={14} />
              <strong>历史工作画像</strong>
            </div>
            <WorkHistoryCards
              cards={assessmentHistory}
              onSelect={selectDate}
              selectedDate={selectedDate}
            />
          </section>
        )}

        {activeTab === "trend" && <WorkTrendPanel trend={assessmentTrend} />}

        {activeTab === "workprint" && (
          <WorkprintAndBaseline
            assessment={currentAssessment}
          />
        )}

        {activeTab === "timeline" && (
          <section className="cwp-work-timeline-card">
            <div className="cwp-section-title">
              <PixelIcon name="monitor" size={14} />
              <strong>工作节奏时间线</strong>
            </div>
            <WorkTimeline segments={currentAssessment?.timeline ?? []} />
          </section>
        )}

        {activeTab === "insights" && (
          <AssessmentInsightGrid assessment={currentAssessment} />
        )}

        {activeTab === "dimensions" && (
          <WorkDimensionPanel
            assessment={currentAssessment}
            isToday={isToday}
            report={currentReport}
          />
        )}
      </div>

      {calendarOpen && (
        <div className="cwp-worklog-calendar-popover">
          <div className="cwp-worklog-calendar-head">
            <span>选择日报日期</span>
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

function DailyReportHero({
  assessment,
  isToday,
  report,
}: {
  assessment: DailyWorkAssessment | null;
  isToday: boolean;
  report: WorkLogReport | null;
}) {
  return (
    <section className="cwp-daily-report-hero">
      <div className="cwp-daily-report-copy">
        <span className="cwp-daily-report-eyebrow">
          {isToday ? "Today Workprint" : "History Workprint"}
        </span>
        <h3>{assessment?.dayTypeTitle ?? "数据积累中"}</h3>
        <p>
          {assessment?.corecatSummary ??
            report?.summary ??
            "保持 CoreCat 运行后，将自动生成当天工作画像。"}
        </p>
        <div className="cwp-daily-badge-row">
          {(assessment?.badgeIds ?? ["OBSERVE"]).map((badge) => (
            <span key={badge}>{badge}</span>
          ))}
        </div>
      </div>
      <div className="cwp-daily-score-card">
        <WorkProfileAvatar
          dayType={assessment?.dayType}
          width={180}
          height={144}
        />
      </div>
    </section>
  );
}

function WorkprintAndBaseline({
  assessment,
}: {
  assessment: DailyWorkAssessment | null;
}) {
  return (
    <section className="cwp-daily-report-grid">
      <article className="cwp-workprint-card">
        <div className="cwp-section-title">
          <PixelIcon name="sparkle" size={14} />
          <strong>Workprint 工作指纹</strong>
        </div>
        <div className="cwp-workprint-body">
          <WorkprintGrid
            grid={assessment?.workprint.pixelGrid ?? []}
            height={assessment?.workprint.height ?? 8}
            width={assessment?.workprint.width ?? 8}
          />
          <div className="cwp-workprint-copy">
            <strong>{assessment?.workprint.label ?? "数据积累中"}</strong>
            <p>
              {assessment?.workprint.description ??
                "CoreCat 正在等待更多本地采样，稍后会生成今天独有的数据纹理。"}
            </p>
          </div>
        </div>
      </article>

      <article className="cwp-baseline-card">
        <div className="cwp-section-title">
          <PixelIcon name="clock" size={14} />
          <strong>个人基线对比</strong>
        </div>
        <p>
          {assessment?.baseline.summary ??
            "连续使用几天后，CoreCat 会用近 7 日记录对比今天的节奏。"}
        </p>
        <div className="cwp-baseline-pill-grid">
          <BaselinePill
            label="陪伴"
            value={assessment?.baseline.activeSecondsDeltaRatio}
          />
          <BaselinePill
            label="火力"
            value={assessment?.baseline.loadDeltaRatio}
          />
          <BaselinePill label="IO" value={assessment?.baseline.ioDeltaRatio} />
          <BaselinePill
            label="温度"
            inverse
            value={assessment?.baseline.thermalDeltaRatio}
          />
          <BaselinePill
            label="输入"
            value={assessment?.baseline.inputDeltaRatio}
          />
        </div>
      </article>
    </section>
  );
}

function AssessmentInsightGrid({
  assessment,
}: {
  assessment: DailyWorkAssessment | null;
}) {
  return (
    <section className="cwp-assessment-insights">
      <InsightColumn
        icon="energy"
        items={assessment?.highlights ?? []}
        title="今日亮点"
      />
      <InsightColumn
        icon="shield"
        items={assessment?.risks ?? []}
        title="今日隐患"
      />
      <InsightColumn
        icon="settings"
        items={assessment?.suggestions ?? []}
        title="明日建议"
      />
    </section>
  );
}

function WorkDimensionPanel({
  assessment,
  isToday,
  report,
}: {
  assessment: DailyWorkAssessment | null;
  isToday: boolean;
  report: WorkLogReport | null;
}) {
  const dimensions = assessment?.dimensions ?? report?.dimensions ?? [];

  return (
    <section className="cwp-worklog-layout cwp-worklog-layout-assessment">
      <div className="cwp-worklog-score-panel">
        <div className="cwp-worklog-score-ring">
          <strong>{assessment?.score ?? report?.totalScore ?? 0}</strong>
          <span>/ 100</span>
        </div>
        <div className="cwp-worklog-score-copy">
          <span>{isToday ? "今日五维画像" : "历史五维画像"}</span>
          <p>{report?.summary ?? "暂无足够数据。"}</p>
        </div>
        <div className="cwp-worklog-mini-stats">
          <div>
            <span>运行时长</span>
            <strong>{formatDuration(report?.activeSeconds ?? 0)}</strong>
          </div>
          <div>
            <span>采样记录</span>
            <strong>{report?.sampleCount ?? 0}</strong>
          </div>
        </div>
      </div>

      <div className="cwp-worklog-dimension-grid">
        {dimensions.map((dimension) => (
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
  );
}

function WorkTrendPanel({
  trend,
}: {
  trend: DailyWorkAssessmentTrend | null;
}) {
  if (!trend || trend.sampleDays === 0) {
    return (
      <section className="cwp-trend-card">
        <div className="cwp-section-title">
          <PixelIcon name="energy" size={14} />
          <strong>近 14 日趋势洞察</strong>
        </div>
        <div className="cwp-trend-empty">
          CoreCat 还没有足够的历史日报。连续使用几天后，这里会显示近期主导形态、最高画像日和节奏线覆盖。
        </div>
      </section>
    );
  }

  return (
    <section className={`cwp-trend-card is-${trend.dominantDayType}`}>
      <div className="cwp-section-title">
        <PixelIcon name="energy" size={14} />
        <strong>近 14 日趋势洞察</strong>
      </div>
      <div className="cwp-trend-head">
        <div className="cwp-trend-copy">
          <span>CoreCat Trend</span>
          <p>{trend.summary}</p>
        </div>
        <div className="cwp-trend-stat-grid">
          <TrendStat label="样本" value={`${trend.sampleDays} 天`} />
          <TrendStat label="平均" value={`${trend.averageScore}`} />
          <TrendStat
            label="最高"
            subValue={trend.bestDate ? formatDateLabel(trend.bestDate) : "--"}
            value={trend.bestScore !== null ? `${trend.bestScore}` : "--"}
          />
          <TrendStat label="首尾" value={formatScoreDelta(trend.scoreDelta)} />
        </div>
      </div>
      <div className="cwp-trend-insight-grid">
        {trend.insights.slice(0, 3).map((item) => (
          <article
            className={`cwp-trend-insight is-${item.severity}`}
            key={`${item.title}-${item.metricValue ?? ""}`}
          >
            <div>
              <strong>{item.title}</strong>
              {item.metricValue ? <span>{item.metricValue}</span> : null}
            </div>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function TrendStat({
  label,
  subValue,
  value,
}: {
  label: string;
  subValue?: string;
  value: string;
}) {
  return (
    <div className="cwp-trend-stat">
      <span>{label}</span>
      <strong>{value}</strong>
      {subValue ? <em>{subValue}</em> : null}
    </div>
  );
}

function WorkHistoryCards({
  cards,
  onSelect,
  selectedDate,
}: {
  cards: DailyWorkAssessmentSummary[];
  onSelect: (date: string) => void;
  selectedDate: string;
}) {
  if (cards.length === 0) {
    return (
      <div className="cwp-history-card-empty">
        CoreCat 还没有可回看的历史画像。保持常驻后，这里会按日期生成工作卡片墙。
      </div>
    );
  }

  return (
    <div className="cwp-history-card-grid">
      {cards.map((card) => (
        <button
          className={`cwp-history-card is-${card.dayType} ${
            card.hasData ? "" : "is-empty"
          } ${
            card.date === selectedDate ? "is-active" : ""
          }`}
          key={card.date}
          onClick={() => onSelect(card.date)}
          type="button"
        >
          <span className="cwp-history-card-date">{formatDateLabel(card.date)}</span>
          <div className="cwp-history-card-main">
            <strong>{card.hasData ? card.dayTypeTitle : "未形成画像"}</strong>
            <em>{card.hasData ? card.score : "--"}</em>
          </div>
          <p>
            {card.hasData
              ? card.corecatSummary
              : "这一天没有足够采样，CoreCat 只保留日期占位。"}
          </p>
          <div className="cwp-history-card-foot">
            <span>{card.hasData ? (card.hasTimeline ? "有节奏线" : "摘要") : "空日期"}</span>
            <div>
              {(card.hasData ? card.badgeIds : ["EMPTY"]).slice(0, 2).map((badge) => (
                <b key={`${card.date}-${badge}`}>{badge}</b>
              ))}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function WorkTimeline({ segments }: { segments: WorkTimelineSegment[] }) {
  if (segments.length === 0) {
    return (
      <div className="cwp-work-timeline-empty">
        CoreCat 正在积累 15 分钟节奏片段。旧日报没有时间片数据时，这里会保持空状态。
      </div>
    );
  }

  return (
    <div className="cwp-work-timeline">
      <div className="cwp-work-timeline-track">
        {segments.map((segment) => (
          <button
            className={`cwp-work-timeline-segment is-${segment.kind}`}
            key={`${segment.startTime}-${segment.endTime}-${segment.kind}`}
            style={
              {
                "--segment-flex": Math.max(1, segment.intensity * 10),
              } as CSSProperties
            }
            title={`${segment.startTime}-${segment.endTime} ${segment.description}`}
            type="button"
          >
            <span>{segment.label}</span>
          </button>
        ))}
      </div>
      <div className="cwp-work-timeline-list">
        {segments.slice(0, 6).map((segment) => (
          <article
            className={`cwp-work-timeline-detail is-${segment.kind}`}
            key={`${segment.startTime}-${segment.endTime}-${segment.label}`}
          >
            <div>
              <strong>{segment.label}</strong>
              <span>
                {segment.startTime} - {segment.endTime}
              </span>
            </div>
            <p>{segment.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function WorkprintGrid({
  grid,
  height,
  width,
}: {
  grid: number[];
  height: number;
  width: number;
}) {
  const cells = grid.length > 0 ? grid : Array.from({ length: width * height }, () => 0);

  return (
    <div
      className="cwp-workprint-grid"
      style={
        {
          "--workprint-cols": width,
        } as CSSProperties
      }
    >
      {cells.map((value, index) => (
        <span
          className={`tone-${Math.max(0, Math.min(4, Math.floor(value)))}`}
          key={`${index}-${value}`}
        />
      ))}
    </div>
  );
}

function BaselinePill({
  inverse = false,
  label,
  value,
}: {
  inverse?: boolean;
  label: string;
  value?: number;
}) {
  const safeValue = value ?? 0;
  const isPositive = inverse ? safeValue < -0.04 : safeValue > 0.04;
  const isWarning = inverse ? safeValue > 0.12 : safeValue < -0.12;

  return (
    <div
      className={`cwp-baseline-pill ${
        isPositive ? "is-positive" : isWarning ? "is-warning" : ""
      }`}
    >
      <span>{label}</span>
      <strong>{formatDelta(safeValue)}</strong>
    </div>
  );
}

function InsightColumn({
  icon,
  items,
  title,
}: {
  icon: PixelIconName;
  items: AssessmentInsight[];
  title: string;
}) {
  const safeItems =
    items.length > 0
      ? items
      : [
          {
            title: "等待更多数据",
            body: "CoreCat 正在积累今天的本地采样。",
            severity: "neutral" as const,
            metricValue: null,
          },
        ];

  return (
    <article className="cwp-assessment-column">
      <div className="cwp-section-title">
        <PixelIcon name={icon} size={14} />
        <strong>{title}</strong>
      </div>
      {safeItems.map((item) => (
        <div
          className={`cwp-assessment-item is-${item.severity}`}
          key={`${title}-${item.title}`}
        >
          <div>
            <strong>{item.title}</strong>
            {item.metricValue ? <span>{item.metricValue}</span> : null}
          </div>
          <p>{item.body}</p>
        </div>
      ))}
    </article>
  );
}

function formatDelta(value: number) {
  const percent = Math.round(Math.abs(value) * 100);
  if (percent === 0) {
    return "±0%";
  }

  return `${value > 0 ? "+" : "-"}${percent}%`;
}

function formatScoreDelta(value: number) {
  if (value === 0) {
    return "±0";
  }

  return `${value > 0 ? "+" : "-"}${Math.abs(value)}`;
}
