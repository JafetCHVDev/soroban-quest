import React, { useState, useCallback } from "react";
import { useTranslation } from "../i18n/useTranslation";
import "./Onboarding.css";

const STEPS_COUNT = 5;

export function shouldShowOnboarding() {
  return !localStorage.getItem("sorobanQuest_onboarding_done");
}

export function markOnboardingDone() {
  localStorage.setItem("sorobanQuest_onboarding_done", "1");
}

export function resetOnboarding() {
  localStorage.removeItem("sorobanQuest_onboarding_done");
}

export default function Onboarding() {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);

  const handleDismiss = useCallback(() => {
    markOnboardingDone();
    setStep(-1);
  }, []);

  const handleNext = useCallback(() => {
    if (step < STEPS_COUNT - 1) setStep((s) => s + 1);
    else handleDismiss();
  }, [step, handleDismiss]);

  const handlePrev = useCallback(() => {
    if (step > 0) setStep((s) => s - 1);
  }, []);

  const handleSkip = useCallback(() => {
    handleDismiss();
  }, [handleDismiss]);

  if (step < 0 || step >= STEPS_COUNT) return null;

  const stepKey = `onboarding.step${step + 1}`;

  return (
    <div className="onboarding-overlay" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className="onboarding-card">
        <h2 id="onboarding-title">{t(`${stepKey}.title`)}</h2>
        <p>{t(`${stepKey}.body`)}</p>

        <div className="onboarding-steps" role="tablist" aria-label="Tutorial steps">
          {Array.from({ length: STEPS_COUNT }, (_, i) => (
            <button
              key={i}
              className={`onboarding-dot${i === step ? " active" : ""}`}
              onClick={() => setStep(i)}
              role="tab"
              aria-selected={i === step}
              aria-label={`Step ${i + 1}`}
            />
          ))}
        </div>

        <div className="onboarding-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleSkip}>
            {t("onboarding.skip")}
          </button>

          {step > 0 && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={handlePrev}>
              {t("onboarding.prev")}
            </button>
          )}

          <button type="button" className="btn btn-primary btn-sm" onClick={handleNext}>
            {step < STEPS_COUNT - 1 ? t("onboarding.next") : t("onboarding.dismiss")}
          </button>
        </div>
      </div>
    </div>
  );
}
