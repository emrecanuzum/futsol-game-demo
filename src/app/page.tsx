"use client";
import { useEffect, useRef, useState } from "react";
import team_a from "./team_a.json";
import team_b from "./team_b.json";

export default function Home() {
  const positions = [0, 1, 2, 3, 4];
  const [currentPosition, setCurrentPosition] = useState(3);
  const [attackingTeam, setAttackingTeam] = useState<any>();
  const [defendingTeam, setDefendingTeam] = useState<any>();
  const [isFirstPlayed, setIsFirstPlayed] = useState(false);
  const [minute, setMinute] = useState(0);

  const [teamAScore, setTeamAScore] = useState(0);
  const [teamBScore, setTeamBScore] = useState(0);
  const [teamALogs, setTeamALogs] = useState<string[]>([]);
  const [teamBLogs, setTeamBLogs] = useState<string[]>([]);
  const [minuteLogs, setMinuteLogs] = useState(0);

  const [displayedTeamALogs, setDisplayedTeamALogs] = useState<string[]>([]);
  const [displayedTeamBLogs, setDisplayedTeamBLogs] = useState<string[]>([]);

  useEffect(() => {
    if (minute >= 90 && teamAScore != teamBScore) {
      // Stop the game
      // You could also update state here to reflect the game has ended, e.g., setting a "gameOver" state
      console.log("Match has ended.");
      return;
      // Optionally clear the interval here if not done elsewhere
    }
  }, [minute, teamAScore, teamBScore]);
  // Effect for Team A Logs
  useEffect(() => {
    if (teamALogs.length > displayedTeamALogs.length) {
      const timerId = setTimeout(() => {
        setDisplayedTeamALogs(
          teamALogs.slice(0, displayedTeamALogs.length + 1)
        );
      }, 100);
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
      }, 100);
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

  useEffect(() => {
    setMinuteLogs(minute);
  }, [minute]);

  const decideStart = async () => {
    if (!isFirstPlayed) {
      const selectedTeam = Math.random() < 0.5 ? team_a : team_b;
      setAttackingTeam(selectedTeam);
      addLog(selectedTeam, `${selectedTeam.name} is started the game`);
      MidfieldsGame(selectedTeam);
      setIsFirstPlayed(true);
    }
  };

  useEffect(() => {
    if (minute <= 90) {
      // This effect triggers the midfield game when the position is set to 2
      if (currentPosition === 2 && attackingTeam) {
        MidfieldsGame(attackingTeam);
        setMinute(minute + 5);
        console.log(minute);
      }
    } else {
      addLog(attackingTeam, `Match ended`);
    }
  }, [currentPosition, attackingTeam, minute]);

  useEffect(() => {
    if (minute <= 90) {
      // This effect triggers the attackers game when the position is set to 3
      if ((currentPosition === 3 || currentPosition === 1) && attackingTeam) {
        AttackersGame(attackingTeam);
        setMinute(minute + 5);
        console.log(minute);
      }
    } else {
      addLog(attackingTeam, `Match ended`);
    }
  }, [currentPosition, minute, attackingTeam]);

  useEffect(() => {
    // This effect handles the transition from attacking directly to goalkeeping if the position is 4
    if ((currentPosition === 4 || currentPosition === 0) && attackingTeam) {
      GoalkeepersGame(attackingTeam);
      setMinute(minute + 5);
      console.log(minute);
    }
  }, [currentPosition, attackingTeam]);

  useEffect(() => {
    setCurrentPosition(2);
    setMinute(minute + 5);
  }, [teamAScore, teamBScore]);

  const rollDice = (max: any) => Math.floor(Math.random() * (max + 1));
  const empty_message = ".  ";
  const addLog = (team: any, message: string) => {
    if (team === team_a) {
      setTeamALogs((prevLogs) => [...prevLogs, message]);
      // Add an empty log for team B to maintain alignment
      setTeamBLogs((prevLogs) => [...prevLogs, empty_message]);
    } else {
      setTeamBLogs((prevLogs) => [...prevLogs, message]);
      // Add an empty log for team A to maintain alignment
      setTeamALogs((prevLogs) => [...prevLogs, empty_message]);
    }
  };

  const GoalkeepersGame = (attackingTeam: any) => {
    const goalkeeper = (attackingTeam === team_a ? team_b : team_a).players.gk;

    const defendingTeam = attackingTeam === team_a ? team_b : team_a;
    const defendingPlayer =
      defendingTeam.players.def[
        Math.floor(Math.random() * defendingTeam.players.def.length)
      ];
    addLog(
      attackingTeam,
      `Goalkeeper ${goalkeeper.name} prepares to defend the goal.`
    );

    // Simulate goalkeeper's attempt to save
    const saveSuccess = rollDice(goalkeeper.skill) > 9; // Adjust threshold as needed
    if (saveSuccess) {
      addLog(
        attackingTeam,
        `Goalkeeper ${goalkeeper.name} makes an incredible save!`
      );
      // Ball goes to midfield, defending team attacks now
      setAttackingTeam(defendingTeam);
      addLog(
        defendingTeam,
        `Defender ${defendingPlayer.name} has the ball and is looking to pass.`
      );
      // Simulate pass success or failure
      const passSuccess = rollDice(defendingPlayer.pass) > 9; // Adjust threshold as needed
      if (passSuccess) {
        setAttackingTeam(attackingTeam === team_a ? team_b : team_a);
        addLog(
          attackingTeam === team_a ? team_b : team_a,
          `${defendingPlayer.name} makes a successful pass to midfield.`
        );
        setCurrentPosition(2);
        MidfieldsGame(attackingTeam);
        // setAttackingTeam(attackingTeam === team_a ? team_b : team_a); // Switch attacking team
      } else {
        setAttackingTeam(attackingTeam === team_a ? team_a : team_b);
        addLog(defendingTeam, `${defendingPlayer.name} fails to make a pass.`);
        setAttackingTeam(attackingTeam === team_a ? team_b : team_a);
        setCurrentPosition(currentPosition);

        // setAttackingTeam(attackingTeam === team_a ? team_b : team_a);
        AttackersGame(attackingTeam);
      }
      setCurrentPosition(attackingTeam === team_a ? 3 : 1);

      setAttackingTeam(attackingTeam === team_a ? team_b : team_a);
    } else {
      addLog(attackingTeam, `${attackingTeam.name} scores!`);
      // Update the score
      if (attackingTeam === team_a) {
        setTeamAScore((prevScore) => prevScore + 1);
      } else {
        setTeamBScore((prevScore) => prevScore + 1);
      }
      // Restart from midfield with the scoring team attacking
      setCurrentPosition(2);

      setAttackingTeam(attackingTeam === team_a ? team_b : team_a);
      addLog(
        attackingTeam === team_a ? team_b : team_a,
        `${(attackingTeam === team_a ? team_b : team_a).name} starts the game!`
      );
      // Optionally, you can switch the attacking team here
    }
  };

  // const DefendersGame = (attackingTeam: any) => {
  //   const defender =
  //     attackingTeam.players.def[
  //       Math.floor(Math.random() * attackingTeam.players.def.length)
  //     ];
  //   addLog(
  //     attackingTeam,
  //     `Defender ${defender.name} has the ball and is looking to pass.`
  //   );

  //   // Simulate pass success or failure
  //   const passSuccess = rollDice(defender.pass) > 9; // Adjust threshold as needed
  //   if (passSuccess) {
  //     addLog(
  //       attackingTeam,
  //       `${defender.name} makes a successful pass to midfield.`
  //     );
  //     setCurrentPosition(2); // Ball is now in midfield
  //     setAttackingTeam(attackingTeam === team_a ? team_b : team_a); // Switch attacking team
  //   } else {
  //     addLog(
  //       attackingTeam,
  //       `${defender.name} fails to make a successful pass.`
  //     );
  //     setCurrentPosition(currentPosition);
  //     setAttackingTeam(attackingTeam === team_a ? team_b : team_a);

  //     // Here, you might decide to switch possession or keep the ball with the defending team
  //   }
  // };

  const AttackersGame = (attackingTeam: any) => {
    const defendingTeam = attackingTeam === team_a ? team_b : team_a;
    const defendingPlayer =
      defendingTeam.players.def[
        Math.floor(Math.random() * defendingTeam.players.def.length)
      ];
    const attacker =
      attackingTeam.players.atk[
        Math.floor(Math.random() * attackingTeam.players.atk.length)
      ];
    addLog(
      attackingTeam,
      `Attacker ${attacker.name} attempts to breach the defense.`
    );

    // Simulate attacking success or failure
    const attackSuccess = rollDice(attacker.shoot) > 12; // Adjust threshold as needed
    // if (attackSuccess) {
    //   addLog(attackingTeam, `${attacker.name} shoot great!`);
    //   setCurrentPosition(4); // Attempt on goal
    // } else {
    //   addLog(attackingTeam, `${attacker.name} is stopped by the defense.`);

    //   setCurrentPosition(currentPosition);
    //   setAttackingTeam(attackingTeam === team_a ? team_a : team_b);
    // }
    if (attackSuccess) {
      addLog(attackingTeam, `${attacker.name} shoot great!`);
      // setCurrentPosition(4);

      addLog(
        defendingTeam,
        `${defendingPlayer.name} trying to stop ${attacker.name}`
      );
      const defenseRoll = rollDice(defendingPlayer.def);

      if (defenseRoll <= 10) {
        addLog(defendingTeam, `defend failed`);
        addLog(attackingTeam, "Shoot goes to the goalkeeper");
        setCurrentPosition(attackingTeam === team_a ? 4 : 0);
        GoalkeepersGame(attackingTeam);
        // AttackersGame(attackingTeam);
      } else {
        addLog(
          defendingTeam,
          `${defendingPlayer.name} successfully defended the ball!`
        );
        setAttackingTeam(defendingTeam);
        addLog(
          defendingTeam,
          `Defender ${defendingPlayer.name} has the ball and is looking to pass.`
        );
        // Simulate pass success or failure
        const passSuccess = rollDice(defendingPlayer.pass) > 9; // Adjust threshold as needed
        if (passSuccess) {
          setAttackingTeam(attackingTeam === team_a ? team_b : team_a);
          addLog(
            attackingTeam === team_a ? team_b : team_a,
            `${defendingPlayer.name} makes a successful pass to midfield.`
          );
          setCurrentPosition(2);
          // setAttackingTeam(attackingTeam === team_a ? team_b : team_a); // Switch attacking team
        } else {
          setAttackingTeam(attackingTeam === team_a ? team_a : team_b);
          addLog(
            defendingTeam,
            `${defendingPlayer.name} fails to make a pass.`
          );
          setAttackingTeam(attackingTeam === team_a ? team_b : team_a);
          setCurrentPosition(currentPosition);

          // setAttackingTeam(attackingTeam === team_a ? team_b : team_a);
          AttackersGame(attackingTeam);
        }
        // setAttackingTeam(defendingTeam);
        // setCurrentPosition(
        //   attackingTeam === team_a ? currentPosition - 1 : currentPosition + 1
        // );
      }
    } else {
      addLog(attackingTeam, `${attacker.name} is stopped by the defense.`);
      setAttackingTeam(attackingTeam === team_a ? team_b : team_a);
      const passSuccess = rollDice(defendingPlayer.pass) > 9; // Adjust threshold as needed
      if (passSuccess) {
        addLog(
          defendingTeam,
          `${defendingPlayer.name} makes a successful pass to midfield.`
        );
        setCurrentPosition(2);
        setAttackingTeam(attackingTeam === team_a ? team_b : team_a); // Switch attacking team
      } else {
        addLog(defendingTeam, `${defendingPlayer.name} fails to make a pass.`);
        setCurrentPosition(currentPosition);

        setAttackingTeam(attackingTeam === team_a ? team_b : team_a);
        AttackersGame(attackingTeam);
      }

      // setCurrentPosition(currentPosition);
      // setAttackingTeam(attackingTeam === team_a ? team_a : team_b);
    }
  };

  const MidfieldsGame = (attackingTeam: any) => {
    setAttackingTeam(attackingTeam);
    console.log(attackingTeam);
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
        setCurrentPosition(attackingTeam === team_a ? 3 : 1);
        AttackersGame(attackingTeam);
      } else {
        addLog(defendingTeam, `${defendingPlayer.name} successfully defended!`);
        setAttackingTeam(defendingTeam);
        setCurrentPosition(
          attackingTeam === team_a ? currentPosition - 1 : currentPosition + 1
        );
      }
    } else {
      addLog(attackingTeam, `${attackingPlayer.name} failed to pass...`);
      setAttackingTeam(defendingTeam);
    }
  };

  return (
    <main className="bg-neutral-500 overflow-hidden h-screen">
      <div className="container mx-auto pt-[10vh] justify-center">
        <div className="border justify-center mx-auto overflow-auto  bg-neutral-50 rounded-lg border-black h-[70vh] w-[90vw] md:w-[60vw]">
          <div className="score-part text-center items-center border-b border-black bg-neutral-200">
            <h1 className="text-xl grid grid-cols-2 ">
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
          <div className="game-part w-full h-[80%]">
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
