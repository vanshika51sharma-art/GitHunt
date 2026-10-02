import React, { useState, useEffect, useRef } from 'react';
import { 
  RepositoryMetadata, 
  FileNode, 
  TreasureTarget, 
  SonarState, 
  GuessRecord, 
  GameScore, 
  PresetIsland, 
  CaptainLogEntry 
} from './types/githunt';
import { 
  parseGitHubUrl, 
  fetchRepositoryMetadata, 
  fetchRepositoryTree, 
  fetchFileContent, 
  selectCandidateFiles, 
  buildPresetTree, 
  getLanguageFromExtension 
} from './services/githubService';
import { generateTreasureClue } from './services/geminiService';
import { calculateSonarState, calculateGameScore } from './utils/sonarRadar';
import { soundEngine } from './utils/soundEngine';

import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { VoyageLoading } from './components/VoyageLoading';
import { SonarRadar } from './components/SonarRadar';
import { IslandMap } from './components/IslandMap';
import { CodeArena } from './components/CodeArena';
import { ParrotCoPilot } from './components/ParrotCoPilot';
import { SkillScroll } from './components/SkillScroll';
import { ShareableFlexCard } from './components/ShareableFlexCard';
import { CaptainLog } from './components/CaptainLog';
import { LeaderboardModal } from './components/LeaderboardModal';
import { SettingsModal } from './components/SettingsModal';

export const App: React.FC = () => {
  // Theme State: 'dark' | 'light'
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('githunt_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  // Game Stage: 'landing' | 'voyaging' | 'hunting' | 'looted'
  const [stage, setStage] = useState<'landing' | 'voyaging' | 'hunting' | 'looted'>('landing');

  // Navigation & Repository State
  const [currentRepo, setCurrentRepo] = useState<RepositoryMetadata | null>(null);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [activeIslandPreset, setActiveIslandPreset] = useState<PresetIsland | null>(null);

  // Selected File & Code Arena State
  const [selectedFilePath, setSelectedFilePath] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [fileLanguage, setFileLanguage] = useState<string>('typescript');
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);

  // Treasure Target & Clue Master State
  const [treasureTarget, setTreasureTarget] = useState<TreasureTarget | null>(null);
  const [sonarState, setSonarState] = useState<SonarState>({
    currentFilePath: '',
    temperature: 'frozen',
    similarityPercent: 0,
    fathomsDistance: null,
    statusMessage: '🧊 FROZEN — No coordinates locked on radar.',
  });

  // Gameplay Run Stats
  const [startTime, setStartTime] = useState<number>(0);
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [lastGuess, setLastGuess] = useState<GuessRecord | null>(null);
  const [finalScore, setFinalScore] = useState<GameScore | null>(null);
  const [doubloonsTally, setDoubloonsTally] = useState<number>(0);

  // UI Modals & Parrot Drawer State
  const [isParrotOpen, setIsParrotOpen] = useState<boolean>(false);
  const [isFlexCardOpen, setIsFlexCardOpen] = useState<boolean>(false);
  const [isLogOpen, setIsLogOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(soundEngine.getMuted());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Apply theme to <html> element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('githunt_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Load existing Doubloons tally from Captain's Log
  useEffect(() => {
    try {
      const raw = localStorage.getItem('githunt_captain_log');
      if (raw) {
        const entries: CaptainLogEntry[] = JSON.parse(raw);
        const total = entries.reduce((acc, curr) => acc + curr.doubloons, 0);
        setDoubloonsTally(total);
      }
    } catch {
      // Ignore
    }
  }, []);

  // Update Sonar Radar when selected file or target changes
  useEffect(() => {
    if (treasureTarget && selectedFilePath) {
      const state = calculateSonarState(selectedFilePath, treasureTarget.filePath);
      setSonarState(state);
    }
  }, [selectedFilePath, treasureTarget]);

  // Start voyage for arbitrary GitHub URL
  const handleStartHunt = async (inputUrl: string) => {
    setErrorMessage(null);
    const parsed = parseGitHubUrl(inputUrl);

    if (!parsed) {
      setErrorMessage("Avast! Enter a valid GitHub URL (e.g. 'https://github.com/expressjs/express') or 'owner/repo'.");
      return;
    }

    setStage('voyaging');
    setActiveIslandPreset(null);

    try {
      // 1. Fetch metadata
      const metadata = await fetchRepositoryMetadata(parsed.owner, parsed.repo);
      setCurrentRepo(metadata);

      // 2. Fetch recursive file tree in one call
      const tree = await fetchRepositoryTree(metadata.owner, metadata.repo, metadata.defaultBranch);
      setFileTree(tree);

      // 3. Select candidate treasure file heuristically
      const candidatePaths = selectCandidateFiles(tree, 5);
      if (candidatePaths.length === 0) {
        throw new Error("No readable source code files found in this repository.");
      }

      // Pick the best candidate file
      const targetPath = candidatePaths[0];
      const targetCode = await fetchFileContent(
        metadata.owner,
        metadata.repo,
        targetPath,
        metadata.defaultBranch
      );

      // 4. Consult Clue Master (Gemini API or Procedural Fallback)
      const clueTarget = await generateTreasureClue(targetPath, targetCode);
      setTreasureTarget(clueTarget);

      // 5. Open root or candidate file initially
      const initialFile = candidatePaths[Math.min(1, candidatePaths.length - 1)] || targetPath;
      const initialCode = initialFile === targetPath 
        ? targetCode 
        : await fetchFileContent(metadata.owner, metadata.repo, initialFile, metadata.defaultBranch);

      const ext = initialFile.split('.').pop()?.toLowerCase();
      setSelectedFilePath(initialFile);
      setFileContent(initialCode);
      setFileLanguage(getLanguageFromExtension(ext));

      // Reset run counters
      setStartTime(Date.now());
      setAttemptCount(0);
      setHintsUsed(0);
      setLastGuess(null);
      setStage('hunting');
    } catch (err: any) {
      setStage('landing');
      setErrorMessage(err.message || "Failed to chart the island. Try a curated preset island below!");
    }
  };

  // Start hunt for a curated preset island (instant 1-click play)
  const handleSelectPreset = async (island: PresetIsland) => {
    setErrorMessage(null);
    setStage('voyaging');
    setActiveIslandPreset(island);

    const metadata: RepositoryMetadata = {
      owner: 'pirates',
      repo: island.id,
      fullName: island.name,
      description: island.tagline,
      stars: island.stars,
      language: island.language,
      defaultBranch: 'main',
      isPreset: true,
      tagline: island.tagline,
    };

    setCurrentRepo(metadata);

    // Build virtual tree
    const tree = buildPresetTree(island);
    setFileTree(tree);

    // Construct target
    const target: TreasureTarget = {
      filePath: island.targetFile,
      targetLine: island.targetLine,
      category: island.category,
      riddle: island.riddle,
      revealExplanation: island.revealExplanation,
      whyItMatters: island.whyItMatters,
      theFix: island.theFix,
      conceptTags: island.conceptTags,
    };
    setTreasureTarget(target);

    // Open first file in island (e.g. indexer or target file)
    const firstPath = Object.keys(island.files)[0];
    const initialCode = island.files[firstPath];
    const ext = firstPath.split('.').pop()?.toLowerCase();

    setSelectedFilePath(firstPath);
    setFileContent(initialCode);
    setFileLanguage(getLanguageFromExtension(ext));

    // Wait 1.2s to show smooth voyage animation
    setTimeout(() => {
      setStartTime(Date.now());
      setAttemptCount(0);
      setHintsUsed(0);
      setLastGuess(null);
      setStage('hunting');
    }, 1200);
  };

  // Quick select for popular repos
  const handleSelectPopular = (repo: RepositoryMetadata) => {
    handleStartHunt(repo.fullName);
  };

  // Handle user selecting a file from the Island Map
  const handleSelectFile = async (path: string) => {
    if (path === selectedFilePath || !currentRepo) return;
    setIsLoadingFile(true);
    soundEngine.playSonarPing('cold');

    try {
      let code = '';
      if (activeIslandPreset) {
        code = activeIslandPreset.files[path] || '// Empty scroll';
      } else {
        code = await fetchFileContent(
          currentRepo.owner,
          currentRepo.repo,
          path,
          currentRepo.defaultBranch
        );
      }

      const ext = path.split('.').pop()?.toLowerCase();
      setSelectedFilePath(path);
      setFileContent(code);
      setFileLanguage(getLanguageFromExtension(ext));
    } catch (err: any) {
      alert(`Could not chart file "${path}": ${err.message}`);
    } finally {
      setIsLoadingFile(false);
    }
  };

  // Handle user clicking a line in the Code Arena
  const handleGuessLine = (lineNumber: number) => {
    if (!treasureTarget) return;

    const isSameFile = selectedFilePath.toLowerCase() === treasureTarget.filePath.toLowerCase();
    const diff = isSameFile ? Math.abs(lineNumber - treasureTarget.targetLine) : 999;
    const newAttemptCount = attemptCount + 1;
    setAttemptCount(newAttemptCount);

    // Update line-level sonar radar
    const updatedRadar = calculateSonarState(
      selectedFilePath,
      treasureTarget.filePath,
      lineNumber,
      treasureTarget.targetLine
    );
    setSonarState(updatedRadar);

    const record: GuessRecord = {
      filePath: selectedFilePath,
      line: lineNumber,
      result: isSameFile && diff === 0 ? 'exact' : diff <= 4 ? 'near' : 'far',
      timestamp: Date.now(),
      fathomsAway: diff,
    };
    setLastGuess(record);

    // If correct -> Claim Loot!
    if (isSameFile && diff === 0) {
      const timeSpent = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      const score = calculateGameScore(timeSpent, newAttemptCount - 1, hintsUsed);
      setFinalScore(score);

      // Update total doubloons tally
      const newTotal = doubloonsTally + score.doubloons;
      setDoubloonsTally(newTotal);

      // Save to Captain's Conquest Journal in localStorage
      try {
        const logEntry: CaptainLogEntry = {
          id: `log-${Date.now()}`,
          repoName: currentRepo?.fullName || currentRepo?.repo || 'Uncharted Isle',
          completedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          doubloons: score.doubloons,
          timeTaken: `${Math.floor(timeSpent / 60)}m ${timeSpent % 60}s`,
          category: treasureTarget.category,
          targetFile: treasureTarget.filePath,
          pirateRank: score.pirateRank.title,
        };

        const existingRaw = localStorage.getItem('githunt_captain_log');
        const existing: CaptainLogEntry[] = existingRaw ? JSON.parse(existingRaw) : [];
        existing.unshift(logEntry);
        localStorage.setItem('githunt_captain_log', JSON.stringify(existing.slice(0, 30)));
      } catch {
        // LocalStorage fallback
      }

      // Transition to Loot Screen
      setTimeout(() => {
        setStage('looted');
      }, 700);
    }
  };

  // Reset to landing
  const handleNewVoyage = () => {
    soundEngine.playCannon();
    setStage('landing');
    setCurrentRepo(null);
    setTreasureTarget(null);
    setFinalScore(null);
  };

  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="min-h-screen transition-colors duration-300 flex flex-col selection:bg-amber-500/30 selection:text-amber-400 dark:selection:text-amber-300">

      {/* Top Cyber-Pirate Header */}
      <Navbar
        currentRepo={currentRepo}
        doubloons={doubloonsTally}
        isMuted={isMuted}
        theme={theme}
        onToggleMute={handleToggleMute}
        onToggleTheme={handleToggleTheme}
        onOpenLog={() => setIsLogOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNewVoyage={handleNewVoyage}
      />

      {/* Main Content Area based on Stage */}
      <main className="flex-1 flex flex-col">

        {/* 1. Landing Stage */}
        {stage === 'landing' && (
          <LandingHero
            onStartHunt={handleStartHunt}
            onSelectPreset={handleSelectPreset}
            onSelectPopular={handleSelectPopular}
            isLoading={false}
            errorMessage={errorMessage}
          />
        )}

        {/* 2. Voyaging Stage (Loading Screen) */}
        {stage === 'voyaging' && currentRepo && (
          <VoyageLoading repoName={currentRepo.fullName || currentRepo.repo} />
        )}

        {/* 3. The Interactive Hunting Arena */}
        {stage === 'hunting' && treasureTarget && currentRepo && (
          <div className="flex-1 p-3 sm:p-4 lg:p-6 max-w-[1600px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4">

            {/* Left Column (4 cols): Sonar Radar HUD + Island Map */}
            <div className="lg:col-span-4 flex flex-col gap-4">

              {/* Sonar Radar HUD */}
              <SonarRadar
                sonarState={sonarState}
                onManualPing={() => {
                  // Manual ping
                }}
              />

              {/* Island Map Tree Explorer */}
              <div className="flex-1 min-h-[380px] lg:min-h-[450px]">
                <IslandMap
                  tree={fileTree}
                  selectedFilePath={selectedFilePath}
                  targetFilePath={treasureTarget.filePath}
                  onSelectFile={handleSelectFile}
                />
              </div>

            </div>

            {/* Right Column (8 cols): Interactive Code Arena */}
            <div className="lg:col-span-8 flex flex-col min-h-[550px]">
              <CodeArena
                filePath={selectedFilePath}
                code={fileContent}
                language={fileLanguage}
                riddle={treasureTarget.riddle}
                category={treasureTarget.category}
                targetLine={treasureTarget.targetLine}
                isTargetFile={selectedFilePath.toLowerCase() === treasureTarget.filePath.toLowerCase()}
                theme={theme}
                onGuessLine={handleGuessLine}
                onSummonParrot={() => setIsParrotOpen(true)}
                lastGuess={lastGuess}
                attemptCount={attemptCount}
              />
            </div>

            {/* Percy The AI Parrot Co-Pilot Chat Dock */}
            <ParrotCoPilot
              isOpen={isParrotOpen}
              onClose={() => setIsParrotOpen(false)}
              target={treasureTarget}
              attemptCount={attemptCount}
              currentFilePath={selectedFilePath}
              onHintUsed={() => setHintsUsed((prev) => prev + 1)}
            />

          </div>
        )}

        {/* 4. Loot & Learning Screen */}
        {stage === 'looted' && treasureTarget && currentRepo && finalScore && (
          <SkillScroll
            target={treasureTarget}
            repo={currentRepo}
            score={finalScore}
            onOpenFlexCard={() => setIsFlexCardOpen(true)}
            onPlayAgain={handleNewVoyage}
            onOpenLog={() => setIsLogOpen(true)}
          />
        )}

      </main>

      {/* Shareable Flex Card Modal */}
      {treasureTarget && currentRepo && finalScore && (
        <ShareableFlexCard
          isOpen={isFlexCardOpen}
          onClose={() => setIsFlexCardOpen(false)}
          target={treasureTarget}
          repo={currentRepo}
          score={finalScore}
        />
      )}

      {/* Captain's Journal Modal */}
      <CaptainLog
        isOpen={isLogOpen}
        onClose={() => setIsLogOpen(false)}
      />

      {/* Hall of Fame Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        playerDoubloons={doubloonsTally}
      />

      {/* Captain's Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isMuted={isMuted}
        theme={theme}
        onToggleMute={handleToggleMute}
        onToggleTheme={handleToggleTheme}
      />

    </div>
  );
};

export default App;