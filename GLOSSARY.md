# Jury Duty

A courtroom game where players sit on a jury, hear a made-up trial, and deliberate to a verdict. These are the terms the game, the code and its docs should use.

## Playing together

**Courtroom screen**:
The one shared display (usually a laptop or TV) that shows the trial, the jury room and the verdict to everyone in the room. It has no seat on the jury.
_Avoid_: Host screen, main screen, TV

**Game code**:
A four-letter code, without look-alike letters, that identifies one game so jurors can join it from their phones.
_Avoid_: Room code, PIN, game ID

## The jury

**Seat**:
One of the six places on the jury. Every seat is held by either a human juror or a computer juror.
_Avoid_: Slot, spot

**Human juror**:
A person playing the game, using their own phone to take notes, ask questions, argue and vote.
_Avoid_: Player (when a seat is meant), user

**Foreperson**:
The juror who leads the jury: they set the pace of the trial, call votes and read the verdict. With human jurors it is the first to join; in solo play it is a computer juror.
_Avoid_: Host, leader, admin

**Computer juror**:
A juror controlled by the game, with a fixed personality, who fills any seat no person has taken.
_Avoid_: AI juror, bot, NPC

**Juror pool**:
All the computer jurors the game can choose from. Each game picks five of them.
_Avoid_: Roster, cast, deck

**Replay code**:
A four-character code shown on the report card. Entering it with the same case brings back the same people, so friends can play exactly the same jury and compare.
_Avoid_: Seed (in anything players see), game code (that identifies a live multiplayer game)

**Fact**:
A piece of evidence from the trial that a juror can write in their notebook and argue with in the jury room.
_Avoid_: Card, note, clue

**Struck fact**:
A fact the judge ordered the jury to ignore. Arguing with one makes computer jurors trust that juror less. Players are told the judge "threw it out."
_Avoid_: Inadmissible fact, thrown-out evidence (in code and docs)

**Notebook**:
A human juror's private list of facts, limited to seven.
_Avoid_: Hand, notes

**Ballot**:
One juror's vote on the verdict. Human jurors' ballots are secret; only the totals are revealed, while computer jurors' ballots are shown by name.
_Avoid_: Poll

## During the trial and deliberation

**Juror question**:
A written question a juror sends to the judge for the witness on the stand. Each human juror has one per trial.
_Avoid_: Ask, query

**Turn**:
One round of deliberation in which every human juror chooses a fact to argue, and who to say it to, or chooses to let others talk. A deliberation has six turns.
_Avoid_: Round, move

**Mood**:
How a computer juror is currently leaning on the verdict, shown to everyone (for example "Leaning guilty").
_Avoid_: Lean, opinion score

**Expression**:
The look on a character's face at a moment in the trial: calm, nervous, angry, sad, smug or surprised.
_Avoid_: Mood (that means a computer juror's leaning), emotion, face

**Report card**:
A juror's private summary at the end of a case: their notebook, whether they argued with thrown-out evidence, and how their ballot compared with the verdict the evidence supports.
_Avoid_: Score, results

## Noticing and arguing

**Contradiction**:
Testimony that conflicts with a fact already in a juror's notebook. A juror who points one out earns a bonus fact.
_Avoid_: Inconsistency, gotcha, lie

**Bonus fact**:
A strong fact a juror earns by finding a contradiction. It does not take a notebook slot.
_Avoid_: Reward card, clue

**Reaction**:
A computer juror's brief, visible response to a moment in the trial (a change of expression and a short word) that nudges their mood.
_Avoid_: Emote, tell

**Approach**:
How a juror makes their point in the jury room: lay out the facts, press hard, or ask a question.
_Avoid_: Tone, style, tactic

**Counter-argument**:
A fact from the trial that a computer juror raises against the point just made.
_Avoid_: Comeback, objection (that word belongs to the lawyers)

**Rebuttal**:
Answering a counter-argument with a fact that directly addresses it.
_Avoid_: Reply, counter-counter
