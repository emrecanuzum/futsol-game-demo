"use client";
import { useEffect, useRef, useState } from "react";
import team_a from "./team_a.json";
import team_b from "./team_b.json";

export default function Home() {
  const positions = [0, 1, 2, 3, 4];
  const [currentPosition, setCurrentPosition] = useState(3);
  const [attackingTeam, setAttackingTeam] = useState<any>();
  const [isFirstPlayed, setIsFirstPlayed] = useState(false);

  const [teamAScore, setTeamAScore] = useState(0);
  const [teamBScore, setTeamBScore] = useState(0);
  const [teamALogs, setTeamALogs] = useState<string[]>([]);
  const [teamBLogs, setTeamBLogs] = useState<string[]>([]);

  const [displayedTeamALogs, setDisplayedTeamALogs] = useState<string[]>([]);
  const [displayedTeamBLogs, setDisplayedTeamBLogs] = useState<string[]>([]);

  // Effect for Team A Logs
  useEffect(() => {
    if (teamALogs.length > displayedTeamALogs.length) {
      const timerId = setTimeout(() => {
        setDisplayedTeamALogs(
          teamALogs.slice(0, displayedTeamALogs.length + 1)
        );
      }, 1000);
      return () => clearTimeout(timerId);
    }
  }, [teamALogs, displayedTeamALogs]);

  // Effect for Team B Logs
  useEffect(() => {
    if (teamBLogs.length > displayedTeamBLogs.length) {
      const timerId = setTimeout(() => {
        setDisplayedTeamBLogs(
          teamBLogs.slice(0, displayedTeamBLogs.length + 1)
        );
      }, 1000);
      return () => clearTimeout(timerId);
    }
  }, [teamBLogs, displayedTeamBLogs]);

  const isFirstPlayedRef = useRef(false);

  useEffect(() => {
    if (!isFirstPlayedRef.current) {
      decideStart();
      isFirstPlayedRef.current = true;
    }
  }, []);

  const decideStart = async () => {
    if (!isFirstPlayed) {
      const selectedTeam = Math.random() < 0.5 ? team_a : team_b;
      setAttackingTeam(selectedTeam);
      addLog(selectedTeam, `${selectedTeam.name} is started the game`);
      MidfieldsGame(selectedTeam);
      setIsFirstPlayed(true);
    }
  };

  const rollDice = (max: any) => Math.floor(Math.random() * (max + 1));

  const addLog = (team: any, message: string) => {
    if (team === team_a) {
      setTeamALogs((prevLogs) => [...prevLogs, message]);
      // Add an empty log for team B to maintain alignment
      setTeamBLogs((prevLogs) => [...prevLogs, "-"]);
    } else {
      setTeamBLogs((prevLogs) => [...prevLogs, message]);
      // Add an empty log for team A to maintain alignment
      setTeamALogs((prevLogs) => [...prevLogs, "-"]);
    }
  };

  const MidfieldsGame = (attackingTeam: any) => {
    const defendingTeam = attackingTeam === team_a ? team_b : team_a;
    const attackingPlayer =
      attackingTeam.players.mid[
        Math.floor(Math.random() * attackingTeam.players.mid.length)
      ];
    addLog(attackingTeam, `Ball is with ${attackingPlayer.name}!`);

    const passRoll = rollDice(attackingPlayer.pass);
    if (passRoll > 9) {
      addLog(
        attackingTeam,
        `${attackingPlayer.name} shoots a great pass! (${passRoll}/${attackingPlayer.pass})`
      );

      const defendingPlayer =
        defendingTeam.players.mid[
          Math.floor(Math.random() * defendingTeam.players.mid.length)
        ];
      addLog(
        defendingTeam,
        `${defendingPlayer.name} trying to stop ${attackingPlayer.name}`
      );

      const defenseRoll = rollDice(defendingPlayer.def);
      if (defenseRoll <= 10) {
        addLog(defendingTeam, `defend failed`);

        addLog(attackingTeam, "The attack continues...");
      } else {
        addLog(defendingTeam, `${defendingPlayer.name} successfully defended!`);
        setAttackingTeam(defendingTeam);
      }
    } else {
      addLog(attackingTeam, `${attackingPlayer.name} failed to pass...`);
      setAttackingTeam(defendingTeam);
    }
  };

  return (
    <main className="bg-neutral-500 overflow-hidden h-screen">
      <div className="container mx-auto pt-[10vh] justify-center">
        <div className="border justify-center mx-auto overflow-auto bg-neutral-50 rounded-lg border-black h-[70vh] w-[90vw] md:w-[30vw]">
          <div className="score-part text-center items-center border-b border-black bg-neutral-200">
            <h1 className="text-xl grid grid-cols-2">
              <div className="border-r border-black py-5">
                {team_a.name}
                <p className="font-semibold text-4xl">{teamAScore}</p>
              </div>
              <div className="py-5">
                {team_b.name}
                <p className="font-semibold text-4xl">{teamBScore}</p>
              </div>
            </h1>
          </div>
          <div className="game-part w-full border-b border-black h-[80%]">
            <div className="grid grid-cols-2 w-full h-full">
              <div className="team_a-side border-r border-black h-full">
                {displayedTeamALogs.map((log, index) => (
                  <p className="text-xs text-center" key={index}>
                    {log}
                  </p>
                ))}
              </div>
              <div className="team_b-side h-full">
                {displayedTeamBLogs.map((log, index) => (
                  <p className="text-xs text-center" key={index}>
                    {log}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
