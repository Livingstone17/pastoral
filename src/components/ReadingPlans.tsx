import { useState } from 'react';
import { READING_PLANS, type ReadingPlan, type ReadingPlanDay } from '../data/readingPlans';

interface Props {
  onBack?: () => void;
  onOpenBible: (ref: string) => void;
}

interface PlanProgress {
  planId: string;
  startedAt: string;
  completedDays: number[]; // 0-indexed day indices
}

function loadProgress(): PlanProgress[] {
  try {
    const raw = localStorage.getItem('shepherd_reading_plans');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveProgress(plans: PlanProgress[]) {
  try {
    localStorage.setItem('shepherd_reading_plans', JSON.stringify(plans));
  } catch { /* ignore */ }
}

function getProgress(planId: string, all: PlanProgress[]): PlanProgress | undefined {
  return all.find((p) => p.planId === planId);
}

function getTodayDayIndex(plan: ReadingPlan, progress: PlanProgress): number {
  if (!progress) return 0;
  const start = new Date(progress.startedAt);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return Math.min(diffDays, plan.days.length - 1);
}

export default function ReadingPlans({ onBack, onOpenBible }: Props) {

  const [progressList, setProgressList] = useState<PlanProgress[]>(loadProgress);
  const [selectedPlan, setSelectedPlan] = useState<ReadingPlan | null>(null);

  const currentPlan = selectedPlan ?? (progressList.length > 0
    ? READING_PLANS.find((p) => p.id === progressList[0].planId) ?? null
    : null);

  function startPlan(plan: ReadingPlan) {
    const existing = progressList.find((p) => p.planId === plan.id);
    if (existing) {
      setSelectedPlan(plan);
      return;
    }
    const updated = [
      { planId: plan.id, startedAt: new Date().toISOString(), completedDays: [] },
      ...progressList,
    ];
    setProgressList(updated);
    saveProgress(updated);
    setSelectedPlan(plan);
  }

  function toggleDay(dayIndex: number) {
    if (!currentPlan) return;
    const updated = progressList.map((p) => {
      if (p.planId !== currentPlan.id) return p;
      const completed = p.completedDays.includes(dayIndex)
        ? p.completedDays.filter((d) => d !== dayIndex)
        : [...p.completedDays, dayIndex];
      return { ...p, completedDays: completed };
    });
    setProgressList(updated);
    saveProgress(updated);
  }

  function readDay(day: ReadingPlanDay) {
    const ref = day.chapter === 1 ? day.book : `${day.book} ${day.chapter}`;
    onOpenBible(ref);
  }

  function abandonPlan() {
    if (!currentPlan) return;
    const updated = progressList.filter((p) => p.planId !== currentPlan.id);
    setProgressList(updated);
    saveProgress(updated);
    setSelectedPlan(null);
  }

  // Plan detail view
  if (currentPlan) {
    const progress = getProgress(currentPlan.id, progressList);
    const todayIdx = getTodayDayIndex(currentPlan, progress!);
    const completedCount = progress?.completedDays.length ?? 0;
    const totalCount = currentPlan.days.length;
    const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
      <div className="flex h-full flex-col overflow-hidden bg-parchment">
        <div className="safe-top shrink-0 px-5 pb-3">
          <div className="flex items-center gap-2.5">
            {onBack && (
              <button
                onClick={onBack}
                aria-label="Back"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-warm-border bg-white text-bark shadow-sm transition-all active:scale-95"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15,18 9,12 15,6" />
                </svg>
              </button>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-serif text-xl font-semibold text-ink">{currentPlan.title}</h1>
              <p className="text-xs text-muted-ink">{completedCount} of {totalCount} days · {pct}%</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-sand">
            <div
              className="h-full rounded-full bg-bark transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6">
          <div className="flex flex-col gap-1.5">
            {currentPlan.days.map((day, idx) => {
              const isCompleted = progress?.completedDays.includes(idx) ?? false;
              const isToday = idx === todayIdx;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                    isToday ? 'border border-bark/30 bg-sand/60' : ''
                  }`}
                >
                  <button
                    onClick={() => toggleDay(idx)}
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                      isCompleted
                        ? 'border-bark bg-bark text-white'
                        : 'border-warm-border bg-white text-transparent hover:border-bark/40'
                    }`}
                  >
                    {isCompleted && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => readDay(day)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className={`block text-sm ${isCompleted ? 'text-muted-ink line-through' : 'font-medium text-ink'}`}>
                      {day.book} {day.chapter}
                    </span>
                    <span className="text-xs text-muted-ink">Day {idx + 1}</span>
                  </button>
                  {isToday && !isCompleted && (
                    <span className="shrink-0 rounded-full bg-bark px-2 py-0.5 text-[0.625rem] font-semibold text-white">
                      Today
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={abandonPlan}
            className="mt-6 w-full rounded-xl border border-red-200 py-3 text-sm font-medium text-red-600"
          >
            Abandon Plan
          </button>
        </div>
      </div>
    );
  }

  // Plan list view
  return (
    <div className="flex h-full flex-col overflow-hidden bg-parchment">
      <div className="safe-top shrink-0 px-5 pb-5">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              aria-label="Back"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-warm-border bg-white text-bark shadow-sm transition-all active:scale-95"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15,18 9,12 15,6" />
              </svg>
            </button>
          )}
          <h1 className="font-serif text-2xl font-semibold text-ink">Reading Plans</h1>
        </div>
        <p className="mt-1 text-sm text-muted-ink">Build a daily Bible reading habit</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <div className="flex flex-col gap-3">
          {READING_PLANS.map((plan) => {
            const progress = getProgress(plan.id, progressList);
            const isActive = !!progress;
            const completedCount = progress?.completedDays.length ?? 0;
            const pct = plan.days.length > 0 ? Math.round((completedCount / plan.days.length) * 100) : 0;

            return (
              <button
                key={plan.id}
                onClick={() => startPlan(plan)}
                className="flex items-start gap-4 rounded-2xl border border-warm-border bg-white p-4 text-left shadow-sm transition-all hover:border-bark/30 active:scale-[0.98]"
              >
                <span className="mt-0.5 text-2xl">{plan.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ink">{plan.title}</span>
                    {isActive && (
                      <span className="rounded-full bg-bark/10 px-2 py-0.5 text-[0.625rem] font-semibold text-bark">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-ink">{plan.description}</p>
                  <p className="mt-1 text-xs text-muted-ink">{plan.days.length} days</p>
                  {isActive && (
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-sand">
                      <div
                        className="h-full rounded-full bg-bark transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="mt-1 shrink-0 text-muted-ink">
                  <polyline points="9,18 15,12 9,6" />
                </svg>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
