import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from '../i18n/useTranslation';
import { getTheoryQuestById } from '../systems/missionLoader';
import { loadProgress, saveProgress } from '../systems/storage';
import { completeMission, recordAttempt } from '../systems/gameEngine';
import { useToast } from '../systems/ToastContext';
import { logActivity, ACTIVITY_TYPES } from '../systems/activityLogger';
import './MissionDetail.css';

export default function TheoryQuestDetail() {
  const { questId } = useParams();
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const toastContext = useToast();
  const showToast = toastContext?.showToast;

  const quest = useMemo(() => getTheoryQuestById(questId, language), [questId, language]);
  const [selectedOption, setSelectedOption] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [resultMessage, setResultMessage] = useState('');

  useEffect(() => {
    const progress = loadProgress();
    setIsCompleted(progress.completedMissions.includes(questId));
  }, [questId]);

  if (!quest) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <h2>{t('missionDetail.notFound.title')}</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
          {t('missionDetail.notFound.body', { id: questId })}
        </p>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/missions')} style={{ marginTop: '1.5rem' }}>
          {t('missionDetail.notFound.back')}
        </button>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!selectedOption || hasAnswered) return;

    const choice = selectedOption.trim();
    const rightAnswer = quest.correctAnswer;
    const correct = choice === rightAnswer;

    setHasAnswered(true);
    setIsCorrect(correct);
    setResultMessage(correct ? t('theoryQuest.correct', 'Correct!') : t('theoryQuest.incorrect', 'Not quite.'));

    if (correct) {
      if (showToast) showToast(t('theoryQuest.correctToast', 'Answer is correct!'), 'success');
      const state = loadProgress();
      const withAttempt = recordAttempt(state, questId);
      saveProgress(withAttempt);
      const next = completeMission(withAttempt, questId, quest.xpReward);
      saveProgress(next);
      logActivity(ACTIVITY_TYPES.MISSION_COMPLETED, { missionId: questId, type: 'theory' }, `Completed theory quest: ${quest.title}`);
      setIsCompleted(true);
      return;
    }

    if (showToast) showToast(t('theoryQuest.incorrectToast', 'Try again — review the explanation.').toString(), 'error');
    const state = loadProgress();
    saveProgress(recordAttempt(state, questId));
  };

  return (
    <div id="main-content" className="mission-detail" style={{ gridTemplateColumns: '1fr', height: 'auto', minHeight: 'calc(100vh - 100px)', overflow: 'auto' }}>
      <div className="mission-story" style={{ borderRight: 'none', maxWidth: '920px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '1rem' }}>
          <span className={`badge badge-${quest.difficulty || 'beginner'}`}>
            {t(`difficulty.${quest.difficulty || 'beginner'}`)}
          </span>
          <span className="mission-card-xp" style={{ marginLeft: '0.5rem' }}>
            {t('missionMap.card.xp', { xp: quest.xpReward })}
          </span>
        </div>

        <ReactMarkdown>{quest.story}</ReactMarkdown>

        <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <h2 style={{ marginBottom: '1rem' }}>{quest.question}</h2>

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {quest.options.map((option) => {
              const selected = selectedOption === option;
              const isRight = hasAnswered && option === quest.correctAnswer;
              const isWrongSelected = hasAnswered && selected && option !== quest.correctAnswer;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => !hasAnswered && setSelectedOption(option)}
                  style={{
                    textAlign: 'left',
                    padding: '0.9rem 1rem',
                    borderRadius: '0.75rem',
                    border: isRight ? '1px solid #16a34a' : isWrongSelected ? '1px solid #ef4444' : selected ? '1px solid var(--primary-color)' : '1px solid var(--border-subtle)',
                    background: isRight ? 'rgba(34, 197, 94, 0.08)' : isWrongSelected ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
                    color: 'var(--text-primary)',
                    cursor: hasAnswered ? 'default' : 'pointer',
                  }}
                >
                  {option}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={!selectedOption || hasAnswered}>
              {t('theoryQuest.submit', 'Submit answer')}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/quests')}>
              {t('common.back', 'Back')}
            </button>
          </div>

          {hasAnswered && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '0.75rem', background: isCorrect ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)', border: `1px solid ${isCorrect ? '#16a34a' : '#ef4444'}` }}>
              <strong>{resultMessage}</strong>
              <p style={{ marginTop: '0.5rem', marginBottom: 0, color: 'var(--text-secondary)' }}>{quest.explanation}</p>
            </div>
          )}

          {isCompleted && (
            <div style={{ marginTop: '1rem', color: '#34d399', fontWeight: 600 }}>
              {t('theoryQuest.completed', 'This theory quest has already been completed.')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
