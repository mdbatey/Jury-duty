# Jury Duty

A courtroom game that runs in your browser. You sit in the jury box, watch a made-up trial play out on a top-down courtroom board, take notes, and then try to persuade the rest of the jury to reach a verdict. At the end you find out what really happened. Play solo with five computer jurors drawn from a pool of ten, or host a game on a laptop or TV and have friends join as jurors from their phones.

**Play it here: https://mdbatey.github.io/Jury-duty/**

All cases are fictional. Some borrow the general shape of common real-world case types, but every name, place and fact is invented.

## How to play

1. Choose **Play solo** and **pick a case** from the docket. (To play with friends, see [Playing with friends](#playing-with-friends).)
2. **Watch the trial.** The trial moves along by itself; tap **Next** (or press the space bar) to skip ahead, or **Pause** to stop it. A bailiff opens court, and the judge hands each witness from one lawyer to the other. Witnesses walk to the stand, lawyers question them, and objections pop up with a plain explanation of what the judge decided. Each line types out; tap **Next** once to finish it and again to move on. Use **Text speed** at the top to pick Slow, Normal or Instant. Turn on **Sound** for a gavel, objection stings and the gallery's murmurs. It's off by default, and only the courtroom screen plays sound, never phones.
3. **Take notes.** When a witness says something important, tap **Write it down**. You have about 15 seconds before each fact disappears. Your notebook holds 7 facts. Be careful: if the judge throws out an answer and you use it later, the other jurors will trust you less. Keep an eye on the jury box too: computer jurors react to what they hear, and those reactions shape where they stand when deliberation starts.
4. **Catch contradictions.** If a witness says something that conflicts with a fact in your notebook, tap **Something's off** and pick that fact. Get it right and you earn a strong bonus fact for the jury room. You get 3 tries per trial, and each case has 2 contradictions to find, one helping each side.
5. **Ask one question.** In each case, one witness takes juror questions right after their cross-examination. You'll get a heads-up when they take the stand. The trial waits while you choose, and the answer can help either side.
6. **Deliberate.** In the jury room, each turn you play a fact from your notebook, choose who to say it to, and choose **how**: **Lay out the facts**, **Press hard** or **Ask a question**. Each juror is moved by different kinds of evidence and likes different approaches:
   - **Ruth:** procedure and records. Likes questions, dislikes being pressed.
   - **Dev:** records and timelines. Likes the facts laid out, dislikes being pressed.
   - **Carla:** motive, character and witnesses. Likes questions, dislikes being pressed.
   - **Hank:** physical evidence, and he's stubborn. Likes being pressed, dislikes questions. Leans toward guilty in criminal cases and toward the defense in civil ones.
   - **Tasha:** procedure and experts. Likes questions, dislikes the facts laid out. Leans toward not guilty in criminal cases.
   - **Marisol:** character and witnesses, and easy to move. Likes questions, dislikes being pressed.
   - **Gordon:** records and experts, and hard to move. Likes the facts laid out, dislikes questions. Doubts the side suing in civil cases.
   - **June:** timelines and procedure. Quiet. Likes questions, dislikes being pressed.
   - **Ray:** physical evidence and procedure, and he's stubborn. Likes being pressed, dislikes questions. A retired police sergeant, he leans toward guilty in criminal cases.
   - **Bree:** timelines and motive, and in a hurry. Likes being pressed, dislikes the facts laid out.

   Each game seats five of them. Every jury has a **holdout**, its most stubborn juror, who starts furthest from where the evidence should lead. The jury room's opening message lists what the jurors at your table care about.

   Jurors who disagree push back with a **counter-argument**, a real fact from the trial. Answer it on the next turn with a fact that rebuts it (your notebook marks which ones do) for a bonus, and it stops pulling the jury.
7. **Vote.** After 6 turns, or whenever you call a vote, the jury votes. Criminal cases must be unanimous. The civil case needs 5 of 6. Otherwise it's a hung jury.
8. **The reveal.** See what really happened, what the case teaches, and a report card on your jury service.

### Replay codes

Every game has a 4-character **replay code**, shown with the report card. It decides which five computer jurors sit, who leads in solo play, and where each juror's mood starts. To play exactly the same jury again, or to let a friend try it, type the code into the box on the case picker and pick the same case. **Retry with this jury** on the verdict screen does the same thing. A code works with any case, and leaving the box blank gives you a new jury.

## Playing with friends

One device is the **courtroom screen** that everyone watches. Each player is a juror on their own phone. Up to six people can play, and computer jurors fill any empty seats.

1. On the laptop or TV, open the game and choose **Host a game**, then pick a case. You can enter a replay code first to get a particular jury. The screen shows a 4-letter **game code**.
2. Everyone else opens the game on their phone, taps **Join a game**, and enters the code and their name. (Or open the join link shown on the courtroom screen.)
3. The first person to join is the **foreperson**. Their phone has **Start trial**, **Next**, **Back** and **Pause**. The trial moves along by itself, and the courtroom screen's space bar works too.
4. During the trial, each phone shows the current line and lets that juror write down facts, each for about 15 seconds. Each juror has their own private 7-fact notebook and one juror question; the trial waits until everyone has asked or tapped **No question**.
5. In the jury room, everyone picks a fact and who to say it to (or lets the others talk) at the same time. The courtroom screen plays the turn out. The foreperson can close a turn early and call votes.
6. Ballots are secret. The courtroom screen shows the totals, the verdict and the true story, and each phone shows that juror's own report card. Both show the replay code.

If a phone locks or reloads, it rejoins with the same seat and notebook. Closing the courtroom screen ends the game.

Phones connect directly to the courtroom screen with [PeerJS](https://peerjs.com/), using its free public service only to find each other. No accounts or servers are needed, but some school or office networks block these connections. See `docs/adr/0001-peer-to-peer-multiplayer-on-github-pages.md`.

## Running it

There's nothing to install. Open `index.html` in any modern browser.

If your browser blocks local files, run a tiny web server from this folder and open the address it prints:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Files

| File | What it does |
| --- | --- |
| `index.html` | The page that loads everything |
| `style.css` | The look of the game, including light and dark mode |
| `cases.js` | The jurors and all trial content. Edit this to add or change cases. |
| `portraits.js` | Code-drawn character faces and their expressions |
| `sound.js` | Courtroom sound effects, generated in code |
| `engine.js` | The game's rules: seats, the trial script, notebooks, deliberation, ballots and report cards. No screen code. |
| `net.js` | The connection between the courtroom screen and phones |
| `game.js` | Every screen: home, solo play, the courtroom screen and the juror's phone |

### Testing multiplayer

- Add `?noauto` to stop the trial from moving on by itself (handy for automated tests).
- Add `?local` to the address (for example `http://localhost:8000/?local`) to connect tabs in the same browser instead of real devices. Open the host in one tab and the join link in others.
- Add `?peerhost=host:port` to use your own [PeerJS server](https://github.com/peers/peerjs-server) instead of the public one.

## Adding a case

Open `cases.js`, copy one of the cases in `window.CASES`, and change it. The comments at the top of the file explain each field. The main parts are:

- **`steps`**: the trial in order. Each step is `judge`, `opening`, `witness`, `closing` or `instructions`.
- **Witness transcripts**: lists of `{ q, a }` question-and-answer pairs. Add `card: "id"` to let the player write that answer down, or `show: "Exhibit label"` to display an exhibit. Objections look like `{ objection, by, ruling, note }`.
- **`cards`**: the facts a player can collect. `dir: 1` points toward guilty or liable, `dir: -1` the other way. `power` runs from 1 to 3. `tags` say what kind of evidence it is. Set `struck: true` for anything the judge throws out.
- **`jury`**: where the computer jurors' moods start and the arguments they raise during deliberation:
  - `base`: the starting mood (0 to 100, where 100 is sure of guilt or liability) for every juror the case doesn't name. Each juror's outlook is added, plus a shift of up to ±6 from the replay code, kept between 15 and 85.
  - `holdout`: the starting mood of the jury's holdout, its most stubborn juror. Set it well away from the verdict the evidence supports, so a jury can't reach it without careful arguing.
  - `start` and `takes` (optional): a starting mood or first comment for a particular juror, used whenever that juror is seated. Jurors without one use their own first comment for criminal or civil cases.
  - `points`: the arguments jurors raise during deliberation.
- **`looks`**: each character's portrait, keyed by their name as it appears in the case: `skin` (0 to 5, light to deep), `hair`, `hairColor`, optional `facial`, `glasses` and `older`, and `clothes`. Anyone without a look gets one generated from their name. A transcript line can set `sfx: "murmur"` to make the gallery murmur after it. A transcript line can set `expression` (`calm`, `nervous`, `angry`, `sad`, `smug` or `surprised`) for the witness's face; otherwise witnesses look nervous on cross-examination and calm on direct.
- **`contradictions`**: testimony that conflicts with an earlier fact. Each names the conflicting line (give that transcript line a `mark`), the earlier fact (`conflictsWith`), the `bonus` fact the finder earns, and an `explain` text. Give each case one pointing each way.
- **Reactions**: computer jurors react on their own to facts matching what they care about. A transcript line can add hand-written ones with `react: [{ juror, word, expression }]`.
- **Deliberation**: a fact can list `rebuts: ["id"]` (the facts it answers) and `replies: { juror: { moved, unmoved } }` for a hand-written reply. Jurors' `approaches` and `replies` (per kind of evidence) live in `window.JURORS` and work for every case.
- **`truth`**: `lawful` is the verdict the evidence supports, `actual` is what really happened, plus the story and the lesson shown at the end.

Check a new case's balance across many replay codes, not just one jury: careful play should reach the verdict the evidence supports almost every time, and careless play almost never.

## Adding a juror

Jurors live in `window.JURORS` at the top of `cases.js`, and every case draws from them. Each needs a name, job, short bio and portrait `look`, plus:

- `likes` (the kinds of evidence that move them) and `sway` (how easily they change their mind, where 1 is average). A juror with `sway` of 0.7 or less can be a jury's holdout, and every jury includes one.
- `outlook` (optional): how far their mood starts toward guilty or liable in every `criminal` or `civil` case, for example `{ criminal: 15 }`. Negative numbers lean the other way.
- `approaches`: the approach they like and the one they dislike.
- `react` words and `faces` for reactions, and `replies` for each of the 8 kinds of evidence.
- `say` lines: `agree`, `moved`, `unmoved`, `struck` (the reminder about thrown-out evidence), and, for the foreperson in solo play, `lead` and `noVerdict` (with `{need}` for the number of votes needed).
- `takes`: their first comment in the jury room for `criminal` and `civil` cases.
- `leads`: whether they can be the foreperson in solo play. Every jury includes at least one who can.
