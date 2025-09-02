## PGN

This template supports Standar PGN format. For the puzzle to work, you will need both the initial starting position, or FEN, and the move list. eg:

```
[FEN "rnbqkbnr/pppp1ppp/8/8/3pPP2/8/PPP3PP/RNBQKBNR b KQkq - 0 3"]

3... Bc5 (3... Nc6) 4. Nf3 d5 (4... Nc6) *

```

If you run into problems loading cards, please check that formatting is correct. Exporting from anaylis software is the best way to ensure good formatting. 

# nags

Numeric Annotation Glyphs or NAGs are used to annotate chess games when using a computer, typically providing an assessment of a chess move or a chess position. Blunders can be marked with ??, ? or ?!, or their equivilent numeric annotation $4, $2 or $6. Good (! or $1) and Excellent (!! or $3) moves will also show an icon when played on front side. 

## Supported Nags
```
    "$1": ["Good move", "!"],
    "$2": ["Poor move", "?"],
    "$3": ["Excellent move!", "!!"],
    "$4": ["Blunder", "??"],
    "$5": ["Interesting move", "!?"],
    "$6": ["Dubious move", "?!"],
    "$9": ["Worst move", "???"],
    "$10": ["Equal chances, quiet position", "="],
    "$11": ["Equal chances, active position", "=†"],
    "$13": ["Unclear position", "∞"],
    "$14": ["White slight advantage", "+/="], // alt: ⩲
    "$15": ["Black slight advantage", "=/+"], // alt: ⩱
    "$16": ["White moderate advantage", "+/-"], // alt: ±
    "$17": ["Black moderate advantage", "-/+"], // alt: ∓
    "$18": ["White decisive advantage", "+-"],
    "$19": ["Black decisive advantage", "-+"],
    "$20": ["White crushing advantage (resign)", ""],
    "$21": ["Black crushing advantage (resign)", ""],
    "$22": ["White in zugzwang", "⨀"],
    "$23": ["Black in zugzwang", "⨀"],
    "$26": ["White moderate space advantage", "○"],
    "$27": ["Black moderate space advantage", "○"],
    "$32": ["White moderate development advantage", "⟳"],
    "$33": ["Black moderate development advantage", "⟳"],
    "$36": ["White has the initiative", "↑"],
    "$37": ["Black has the initiative", "↑"]
```
