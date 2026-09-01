const toggleBookmark = useCallback(
  (missionId: string): void => {
    if (!missionId) return;

    const bookmarkedMissions = progress.bookmarkedMissions ?? [];

    const nextBookmarks = bookmarkedMissions.includes(missionId)
      ? bookmarkedMissions.filter((id) => id !== missionId)
      : [...bookmarkedMissions, missionId];

    updateProgress({
      bookmarkedMissions: nextBookmarks,
    });
  },
  [progress.bookmarkedMissions, updateProgress],
);
