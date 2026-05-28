import React from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

import LobbyHeader from "./components/LobbyHeader";
import RoomCodeCard from "./components/RoomCodeCard";
import MatchConfiguration from "./components/MatchConfiguration";
import JoinRequestsPanel from "./components/JoinRequestsPanel";
import ParticipantsPanel from "./components/ParticipantsPanel";
import GuestWaitingCard from "./components/GuestWaitingCard";
import GeneratingScreen from "./components/GeneratingScreen";
import ReadyScreen from "./components/ReadyScreen";
import ResultsScreen from "./components/ResultsScreen";
import GameOverScreen from "./components/GameOverScreen";
import PodiumScreen from "./components/PodiumScreen";
import VSScreen from "./components/VSScreen";
import SpectatorView from "./components/SpectatorView";
import GamePlayView from "./components/GamePlayView";
import ClassicPlayView from "./components/ClassicPlayView";
import MatchSnapshot from "./components/MatchSnapshot";

import { useCompetitionLobby } from "./hooks/useCompetitionLobby";

const CompetitionLobby = () => {
  const navigate = useNavigate();
  const { roomCode: paramCode } = useParams();
  const [searchParams] = useSearchParams();
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const {
    // Room
    room, roomCode, copied, isHost, isSpectator,
    isStarting, isMusicMuted, settings,
    // Game state
    gameState, currentQuestion, questionIndex, totalQuestions, readyQuestionCount,
    timeRemaining, leaderboard, selectedAnswer, answerResult, isSubmitting,
    userFinished, finishData, gameCategory, gameChallengeMode, currentGameMode,
    isEliminated, playerTeam, teamScores, blitzQuestionTime, finalResults, isDraw,
    // VS / Gamification
    showVS, comboCount, feedbackResult, feedbackKey,
    // Spectator & requests
    spectatorData, pendingRequests, isReady, spectatorCount, isPowerQuestion,
    gameEvents, rematchVotes,
    // Activity feed
    activityEvents,
    // Ref-backed value
    gameDurationRef,
    // Handlers
    handleApproveJoin, handleDenyJoin, handleToggleReady,
    handleCopyCode, handleCopyLink, handleUpdateSettings,
    handleStartGame, handleLaunchGame, handleCancelGame, handlePlayAgain,
    handleSubmitAnswer, handleLeave, handleGoHome, handleRequestRematch,
    handleVSComplete, handleToggleMusic, handleSpectateAfterFinish, handlePracticeNext,
  } = useCompetitionLobby({ paramCode, searchParams, user, dispatch, navigate });

  // ─── VS screen (shown before game starts) ────────────────────
  if (showVS && room?.players) {
    return (
      <VSScreen
        players={room.players}
        settings={settings}
        onComplete={handleVSComplete}
      />
    );
  }

  // ─── Spectator view ───────────────────────────────────────────
  if (isSpectator && (spectatorData || gameState === "playing")) {
    return (
      <SpectatorView
        spectatorData={spectatorData}
        gameState={gameState}
        finalResults={finalResults}
        leaderboard={leaderboard}
        timeRemaining={timeRemaining}
        gameCategory={gameCategory}
        navigate={navigate}
      />
    );
  }

  // ─── Loading (creating / joining room) ───────────────────────
  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <Loader2 size={36} className="animate-spin text-orange-400 mx-auto" />
          <p className="text-zinc-400 text-sm">
            {searchParams.get("join") ? "Joining room…" : "Creating room…"}
          </p>
        </motion.div>
      </div>
    );
  }

  // ─── State screens ────────────────────────────────────────────
  if (gameState === "generating") return <GeneratingScreen />;

  if (gameState === "ready") {
    return (
      <ReadyScreen
        isHost={isHost}
        readyQuestionCount={readyQuestionCount}
        isStarting={isStarting}
        onLaunch={handleLaunchGame}
        onCancel={handleCancelGame}
      />
    );
  }

  if (gameState === "finished" && finalResults) {
    return (
      <GameOverScreen
        finalResults={finalResults}
        isDraw={isDraw}
        userId={user?._id}
        currentGameMode={currentGameMode}
        teamScores={teamScores}
        playerTeam={playerTeam}
        totalQuestions={totalQuestions}
        rematchVotes={rematchVotes}
        onRequestRematch={handleRequestRematch}
        onHome={handleGoHome}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  if (gameState === "playing" && userFinished && finishData) {
    return (
      <ResultsScreen
        finishData={finishData}
        isEliminated={isEliminated}
        currentGameMode={currentGameMode}
        teamScores={teamScores}
        playerTeam={playerTeam}
        userId={user?._id}
        leaderboard={leaderboard}
        onHome={handleGoHome}
        onSpectate={handleSpectateAfterFinish}
      />
    );
  }

  // ─── Playing: General / non-classic challenge ─────────────────
  if (gameState === "playing" && (gameCategory === "general" || gameChallengeMode !== "classic")) {
    return (
      <GamePlayView
        feedbackResult={feedbackResult}
        comboCount={comboCount}
        feedbackKey={feedbackKey}
        timeRemaining={timeRemaining}
        gameDuration={gameDurationRef.current || settings.timerDuration || 300}
        questionIndex={questionIndex}
        currentGameMode={currentGameMode}
        playerTeam={playerTeam}
        userId={user?._id}
        totalQuestions={totalQuestions}
        blitzQuestionTime={blitzQuestionTime}
        spectatorCount={spectatorCount}
        handleLeave={handleLeave}
        isPowerQuestion={isPowerQuestion}
        currentQuestion={currentQuestion}
        answerResult={answerResult}
        isSubmitting={isSubmitting}
        selectedAnswer={selectedAnswer}
        handleSubmitAnswer={handleSubmitAnswer}
        handlePracticeNext={handlePracticeNext}
        userFinished={userFinished}
        leaderboard={leaderboard}
        gameEvents={gameEvents}
        activityEvents={activityEvents}
      />
    );
  }

  // ─── Playing: Programming classic (code editor) ───────────────
  if (gameState === "playing" && gameCategory === "programming" && gameChallengeMode === "classic") {
    return (
      <ClassicPlayView
        feedbackResult={feedbackResult}
        comboCount={comboCount}
        feedbackKey={feedbackKey}
        timeRemaining={timeRemaining}
        gameDuration={gameDurationRef.current || settings.timerDuration || 300}
        questionIndex={questionIndex}
        currentQuestion={currentQuestion}
        handleLeave={handleLeave}
        spectatorCount={spectatorCount}
        isPowerQuestion={isPowerQuestion}
        language={settings.language}
        handleSubmitAnswer={handleSubmitAnswer}
        isSubmitting={isSubmitting}
        answerResult={answerResult}
        leaderboard={leaderboard}
        gameEvents={gameEvents}
        userId={user?._id}
        totalQuestions={totalQuestions}
        activityEvents={activityEvents}
      />
    );
  }

  if (gameState === "finished") {
    return (
      <PodiumScreen
        leaderboard={leaderboard}
        isDraw={isDraw}
        userId={user?._id}
        isHost={isHost}
        rematchVotes={rematchVotes}
        onRequestRematch={handleRequestRematch}
        onHome={() => navigate("/competition")}
        onPlayAgain={isHost ? handlePlayAgain : undefined}
      />
    );
  }

  // ─── Lobby ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-orange-500/30">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <DottedGlowBackground
          color="rgba(255,255,255,0.45)"
          glowColor="rgba(234,88,12,0.95)"
          gap={28}
          radius={1.5}
          opacity={0.55}
          speedMin={0.3}
          speedMax={0.9}
          speedScale={0.85}
        />
        <div className="absolute top-0 left-1/3 w-[700px] h-[400px] bg-orange-600/4 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-red-800/4 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-5">
          <LobbyHeader
            isHost={isHost}
            onLeave={handleLeave}
            isMusicMuted={isMusicMuted}
            onToggleMusic={handleToggleMusic}
          />

          {isHost ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
              <div className="space-y-5 min-w-0 flex flex-col">
                <RoomCodeCard
                  roomCode={roomCode}
                  copied={copied}
                  onCopyCode={handleCopyCode}
                  onCopyLink={handleCopyLink}
                />
                <MatchConfiguration
                  settings={settings}
                  isStarting={isStarting}
                  onUpdateSettings={handleUpdateSettings}
                  onStartGame={handleStartGame}
                  playerCount={room?.players?.length || 0}
                />
                <JoinRequestsPanel
                  pendingRequests={pendingRequests}
                  onApprove={handleApproveJoin}
                  onDeny={handleDenyJoin}
                />
              </div>
              <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
                <ParticipantsPanel room={room} userId={user?._id} />
                <MatchSnapshot settings={settings} />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <RoomCodeCard
                roomCode={roomCode}
                copied={copied}
                onCopyCode={handleCopyCode}
                onCopyLink={handleCopyLink}
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <GuestWaitingCard
                  settings={settings}
                  isReady={isReady}
                  onToggleReady={handleToggleReady}
                  readyCount={room?.readyCount}
                  totalPlayers={room?.players?.length}
                />
                <ParticipantsPanel room={room} userId={user?._id} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetitionLobby;
