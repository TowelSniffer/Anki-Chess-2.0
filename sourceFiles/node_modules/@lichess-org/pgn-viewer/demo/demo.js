import LichessPgnViewer from './lichess-pgn-viewer.js';

const pgns = {
  empty: ``,
  mammoth1: `
[Event "4th Match, 16th game, London 1834"]
[Site "https://lichess.org/study/EV81yS0v/EDqFMrdj"]
[Date "1834"]
[White "Alexander McDonnell"]
[Black "Louis Charles de Labourdonnais"]
[Result "0-1"]
[UTCDate "2022.07.13"]
[UTCTime "15:55:52"]
[Variant "Standard"]
[ECO "B32"]
[Opening "Sicilian Defense: Löwenthal Variation"]
[Annotator "https://lichess.org/@/nickvisel"]

{ This study contains games 1-?? (work in progress), part 1 of ??, from The Mammoth Book of the World's Greatest Chess Games: 4th edition. I'm putting games in as I go through the book.

You can find the book here for an absurdly low price: https://www.amazon.com/Mammoth-Worlds-Greatest-Chess-Games-ebook/dp/B08V23CZM5 }
1. e4 { By the way, I learned about this book thanks to the Perpetual Chess Podcast by Ben Johnson. Link here: https://www.perpetualchesspod.com/new-blog/2022/3/25/book-recap-25-the-mammoth-book-of-the-worlds-greatest-chess-games-with-nm-chrisopher-chabris-and-fm-graham-burgess } 1... c5 2. Nf3 Nc6 3. d4 cxd4 4. Nxd4 e5 5. Nxc6 (5. Nb5) 5... bxc6 6. Bc4 Nf6 7. Bg5 Be7 8. Qe2 { [%cal Ra6f1] } (8. Nc3)  (8. Bxf6 { [%cal Gb1c3,Ge7f6] } 8... Bxf6 9. Nc3) 8... d5 9. Bxf6 (9. exd5 cxd5 (9... Nxd5) 10. Bb5+ Bd7 11. Nc3 (11. Bxd7+ Nxd7 12. Bxe7 Qxe7 { [%csl Ge5,Gd5] }) 11... d4 12. Bxf6 Bxf6 13. Nd5 Qa5+ 14. b4 (14. c3 Bxb5 15. Qxb5+ Qxb5 16. Nc7+ Kd7 17. Nxb5 Rab8 { [%csl Rb2][%cal Gb8b2] }) 14... Bxb5 15. bxa5 Bxe2 16. Nc7+ { [%csl Ra5,Ra2,Rc2] } 16... Kd7 17. Nxa8 Ba6 { [%csl Ra8,Ga7,Gd7][%cal Ra8b6,Ra8c7] }) 9... Bxf6 10. Bb3 O-O 11. O-O a5 { [%csl Re2,Rf1][%cal Ga5a4,Gc8a6,Ga6f1] } 12. exd5 cxd5 13. Rd1 d4 14. c4 { [%csl Ge5,Gd4] } (14. c3)  (14. Nd2) 14... Qb6 15. Bc2 Bb7 (15... Qxb2 16. Bxh7+ { [%csl Gb2][%cal Re2b2] }) 16. Nd2 Rae8 { [%csl Ge8,Gf8,Bf7][%cal Ge5e4,Gf7f4,Bf6d8] } (16... Qxb2 17. Bxh7+ (17. Qd3 e4 (17... g6 18. Rab1 e4) 18. Nxe4 Bxe4 19. Qxe4 g6) 17... Kxh7 18. Rab1) 17. Ne4 Bd8 { [%cal Gf7f5] } 18. c5 Qc6 19. f3 Be7 { [%csl Rd6][%cal Re4d6] } 20. Rac1 f5 21. Qc4+ Kh8 (21... Qd5 22. Qb5 { [%csl Rd5][%cal Gc2b3,Gb3g8] })  (21... Rf7 22. Ba4 Qc8 23. Bxe8 Qxe8 24. Nd6 Bxd6 25. cxd6) 22. Ba4 Qh6 23. Bxe8 (23. Nd6 Bxd6 24. Bxe8 Bc7 25. c6 (25. Qb3 e4 26. g3 Ba6 { [%cal Ga6f1] } (26... Rxe8 27. Qxb7 Qe3+ 28. Kh1 Qxf3+ 29. Kg1)) 25... e4 26. cxb7 (26. h3 Qe3+ 27. Kf1 (27. Kh1 Qf4) 27... Bh2)  (26. g3 Qe3+ 27. Kf1 Qxf3+ 28. Kg1 Bxg3 (28... Bc8 29. Rf1) 29. hxg3 (29. Rf1 Qe3+ 30. Kg2 Be5 (30... Qd2+ 31. Kxg3 f4+ 32. Kh3 f3 33. Rg1 (33. Qc2 Qh6+ 34. Kg3 Qg5+ 35. Kf2 (35. Kh3 Rf4) 35... Qe3+ 36. Kg3 f2+ 37. Kg4 Qf3+ 38. Kh4 Rf4+ 39. Kg5 Qg4#) 33... Qh6+ 34. Kg3 Qf4+ 35. Kf2 (35. Kh3 Rf6 { [%cal Gf6h6] }) 35... Qxh2+ 36. Kf1 e3 { [%cal Ge3e2] }) 31. Qc5 (31. cxb7 Qh6 { [%csl Rh2][%cal Gh6h2] }) 31... Qd2+ 32. Rf2 Qg5+ 33. Kh1 Bd6 34. Qxd6 (34. Qc2 d3) 34... Qxc1+ 35. Kg2 Qg5+ 36. Kh1 Rxe8 (36... Qf6 37. Qxf6 gxf6 38. cxb7 Rxe8 39. Rc2 { [%csl Gb7][%cal Gc2c8] }) 37. cxb7) 29... Qxg3+ 30. Kf1 (30. Kh1 Rf6 { [%cal Gf6h6] }) 30... d3 31. Qc5 (31. cxb7 e3) 31... Rxe8 32. Qg1 Qf3+ 33. Qf2 Qxf2+ 34. Kxf2 e3+ { [%csl Ge1][%cal Gb7a6,Ra6f1,Ge3e2,Ge2e1,Ge8e1] }) 26... Qxh2+ 27. Kf1 exf3 28. gxf3 Qh3+ 29. Ke2 Rxe8+ 30. Kd3 Qxf3+ 31. Kc2 Qxb7) 23... fxe4 24. c6 exf3 (24... Qe3+ 25. Kh1 exf3) 25. Rc2 (25. cxb7 Qe3+ 26. Kh1 fxg2+)  (25. gxf3 Qe3+ 26. Kh1 Qxf3+ 27. Kg1 Rf5) 25... Qe3+ (25... Bc8 26. Bd7) 26. Kh1 (26. Rf2) 26... Bc8 27. Bd7 { [%csl Rd7,Rc8][%cal Gc8f5,Gc8g4] } (27. Bf7 Bg4 28. c7 (28. Rf1 d3 29. Rcf2 d2) 28... fxg2+ 29. Rxg2 Bxd1 30. c8=Q Qe1+ 31. Rg1 Bf3#) 27... f2 { [%cal Gd4d3,Ge3e1,Gc4f1,Ge1d1,Gf2f1,Gf8f1] } 28. Rf1 (28. Qf1 Ba6) 28... d3 29. Rc3 Bxd7 30. cxd7 (30. Rxd3 Be6 (30... Qe2 31. Rc3) 31. Qc2 Qc5) 30... e4 { [%cal Ge3e1] } 31. Qc8 Bd8 32. Qc4 (32. Qc6 Qe1)  (32. Rcc1 Qf4 { [%cal Ge4e3,Ge3e2] }) 32... Qe1 33. Rc1 d2 34. Qc5 Rg8 35. Rd1 e3 36. Qc3 Qxd1 37. Rxd1 e2 0-1
`,
  commentMin1: `1. d4 { some comment! } d5 { and some more! } 2. Nc3`,
  commentMin2: ` 1. e4 { mainline comment! } e5 2. f4 Nf6 (2... Be7 { some comment } 3. Nf3 { another comment }) 3. Nc3 * `,
  shapeMin1: `{ [%csl Gd4,Gf5] }
1. d4 {before [%cal Re2e4] between [%csl Ye5] after} d5 { and some more! }`,
  e4idea1: `
[Event "4. e4! Idea in Rapport-Jobava System: Casabianka's Line"]
[Site "https://lichess.org/study/AiSH1ore/feJhofs0"]
[Result "*"]
[UTCDate "2022.07.19"]
[UTCTime "12:23:50"]
[Variant "Standard"]
[ECO "D01"]
[Opening "Rapport-Jobava System"]
[Annotator "https://lichess.org/@/continuum12"]

{ [%csl Gd4,Gf5] }
1. d4 {before [%cal Re2e4] between [%csl Ye5] after} d5 { and some more! } 2. Nc3 Nf6 3. Bf4 { The Rapport-Jobava system. If you do not yet know what this is, I recommend checking out https://lichess.org/@/continuum12/blog/introducingthe-rapport-jobava-system/R6iFupKK. } 3... c5 4. e4!? { Gambit2Mate's idea; it is not original (has been played before) but Gambit2Mate and others are analyzing this line more extensively and adding a lot of novelties. } 4... Nxe4 { See "other lines" for other lines. However, Nxe4 is the mainline and then best line for Black. } 5. Nb5 $146 { Casabianka suggested this surprisingly practical choice that the computer dislikes at first but then realizes it is fine: } 5... Na6 6. f3 Nf6 7. dxc5 g6! { Only way to develop the bishop for Black. } (7... e6? 8. Nd6+ { Runs into this annoying Nd6 idea }) 8. Be5 Bg7 9. Nc3 { [%csl Rd5][%cal Gc3d5,Gd1d5,Ge5h8] } 9... O-O (9... Nxc5!? { The top engine line that leads to something I cannot yet fully comprehend: } 10. Nxd5 O-O { wow! } 11. Nc7 Ncd7 { Exchange sac: } 12. Nxa8 Nxe5 13. Qxd8 Rxd8 14. Nc7 Bf5 15. c3 Rd7 16. Nb5 Bd3 { Black's activity allows more than enough compensation according to the engine. }) 10. Bxa6 (10. Bxf6? Bxf6 11. Nxd5 Bxb2 12. Rb1 Bg7 13. c4?! { For example } 13... Nxc5 $19 { Is just not good for White! White's weakened king and lack of development causes way too much prblems } { [%cal Ga8c8,Gc8f5,Gd8a5] }) 10... bxa6 11. Nge2 e6 12. Qd4 Nh5 13. O-O-O { Casabianka - continuum12, 1-0, -, lichess.org/Syv5DHdg7U3p } { [%cal Gg2g4,Gh2h4] } *
`,
  croatia: `[Event "SuperUnited Rapid & Blitz Croatia"]
[Site "Zagreb, Croatia"]
[Date "2022.07.24"]
[Round "19.1"]
[White "Saric, Ivan"]
[Black "Vachier-Lagrave, Maxime"]
[Result "0-1"]
[WhiteTitle "GM"]
[WhiteElo "2680"]
[BlackElo "2760"]
[UTCDate "2022.07.24"]
[UTCTime "11:30:10"]
[Variant "Standard"]
[ECO "B90"]
[Opening "Sicilian Defense: Najdorf Variation"]
[Annotator "https://lichess.org/@/Yeltcki"]

1. e4 { [%clk 0:05:03] } 1... c5 { [%clk 0:05:03] } 2. Nf3 { [%clk 0:05:04] } 2... d6 { [%clk 0:05:04] } 3. d4 { [%clk 0:05:05] } 3... cxd4 { [%clk 0:05:05] } 4. Nxd4 { [%clk 0:05:06] } 4... Nf6 { [%clk 0:05:06] } 5. Nc3 { [%clk 0:05:07] } 5... a6 { [%clk 0:05:08] } 6. f3 { [%clk 0:05:02] } 6... e5 { [%clk 0:05:07] } 7. Nb3 { [%clk 0:05:03] } 7... Be6 { [%clk 0:05:08] } 8. Be3 { [%clk 0:05:04] } 8... h5 { [%clk 0:05:07] } 9. Nd5 { [%clk 0:05:03] } 9... Bxd5 { [%clk 0:05:08] } 10. exd5 { [%clk 0:05:04] } 10... Nbd7 { [%clk 0:05:07] } 11. Qd2 { [%clk 0:04:58] } 11... g6 { [%clk 0:05:08] } 12. O-O-O { [%clk 0:04:31] } 12... Bg7 { [%clk 0:05:09] } 13. Kb1 { [%clk 0:04:29] } 13... Rc8 { [%clk 0:05:09] } 14. Be2 { [%clk 0:04:19] } 14... O-O { [%clk 0:04:48] } 15. g4 { [%clk 0:04:14] } 15... Nb6 { [%clk 0:04:10] } 16. Bg5 { [%clk 0:03:26] } 16... hxg4 { [%clk 0:04:09] } 17. fxg4 { [%clk 0:03:16] } 17... Qd7 { [%clk 0:03:00] } 18. Bxf6 { [%clk 0:03:16] } 18... Bxf6 { [%clk 0:03:01] } 19. h4 { [%clk 0:03:15] } 19... e4 { [%clk 0:02:57] } 20. g5 { [%clk 0:03:11] } 20... Be5 { [%clk 0:02:34] } 21. h5 { [%clk 0:02:55] } 21... Nc4 { [%clk 0:02:35] } 22. Bxc4 { [%clk 0:02:55] } 22... Rxc4 { [%clk 0:02:36] } 23. Qe2 { [%clk 0:02:34] } 23... b5 { [%clk 0:02:16] } 24. c3 { [%clk 0:02:10] } 24... e3 { [%clk 0:01:24] } 25. Qxe3 { [%clk 0:02:03] } 25... b4 { [%clk 0:01:25] } 26. Na5 { [%clk 0:01:48] } 26... Rg4 { [%clk 0:01:09] } 27. Nc6 { [%clk 0:01:44] } 27... bxc3 { [%clk 0:01:08] } 28. Nxe5 { [%clk 0:01:40] } 28... dxe5 { [%clk 0:01:01] } 29. Qxc3 { [%clk 0:01:36] } 29... Qf5+ { [%clk 0:00:58] } 30. Ka1 { [%clk 0:01:35] } 30... Rc8 { [%clk 0:00:57] } 31. Qb3 { [%clk 0:01:25] } 31... gxh5 { [%clk 0:00:39] } 32. d6 { [%clk 0:01:09] } 32... Rd4 { [%clk 0:00:34] } 33. Rdf1 { [%clk 0:00:38] } 33... Qe6 { [%clk 0:00:24] } 34. Qf3 { [%clk 0:00:28] } 34... h4 { [%clk 0:00:20] } 35. Qh5 { [%clk 0:00:20] } 35... Ra4 { [%clk 0:00:15] } 36. a3 Rc3 { [%clk 0:00:10] } 37. Qxf7+ { [%clk 0:00:09] } 37... Qxf7 { [%clk 0:00:11] } 38. Rxf7 { [%clk 0:00:11] } 38... Rcxa3+ { [%clk 0:00:08] } 39. bxa3 { [%clk 0:00:11] } 39... Kxf7 { [%clk 0:00:09] } 40. Kb2 { [%clk 0:00:04] } 40... Rg4 { [%clk 0:00:09] } 41. Kc3 { [%clk 0:00:05] } 41... Ke6 { [%clk 0:00:10] } 42. g6 { [%clk 0:00:04] } 42... Kxd6 { [%clk 0:00:11] } 43. g7 { [%clk 0:00:06] } 43... Rxg7 { [%clk 0:00:08] } 44. Rxh4 { [%clk 0:00:07] } 44... Kd5 { [%clk 0:00:08] } 45. Ra4 { [%clk 0:00:08] } 45... Rg3+ { [%clk 0:00:09] } 46. Kd2 { [%clk 0:00:09] } 46... Rg6 { [%clk 0:00:09] } 47. Ke3 { [%clk 0:00:10] } 47... Re6 { [%clk 0:00:08] } 48. Ra5+ { [%clk 0:00:11] } 48... Kc4 { [%clk 0:00:08] } 49. Ke4 { [%clk 0:00:12] } 49... Kb3 { [%clk 0:00:10] } 50. Kd5 { [%clk 0:00:09] } 50... Rb6 { [%clk 0:00:11] } 51. Ke4 { [%clk 0:00:06] } 51... Rh6 { [%clk 0:00:06] } 52. Rxe5 { [%clk 0:00:05] } 52... Kxa3 { [%clk 0:00:07] } 53. Kd3 { [%clk 0:00:05] } 53... Kb3 { [%clk 0:00:08] } 54. Kd2 { [%clk 0:00:04] } 54... Kb2 { [%clk 0:00:09] } 55. Rd5 { [%clk 0:00:04] } 55... Rb6 { [%clk 0:00:08] } 56. Kd3 { [%clk 0:00:03] } 56... Rb5 { [%clk 0:00:09] } 57. Rd6 { [%clk 0:00:04] } 57... a5 { [%clk 0:00:10] } 58. Kc4 { [%clk 0:00:04] } 58... Rb4+ { [%clk 0:00:11] } 59. Kd3 { [%clk 0:00:05] } 59... a4 { [%clk 0:00:11] } 60. Rg6 { [%clk 0:00:05] } 60... a3 { [%clk 0:00:12] } 61. Rg2+ { [%clk 0:00:07] } 61... Kb3 { [%clk 0:00:13] } 62. Rg1 { [%clk 0:00:03] } 62... a2 { [%clk 0:00:14] } 63. Kd4 0-1`,
  lichess: `[Event "Rated Bullet game"]
[Site "https://lichess.org/CM8wuIDf"]
[Date "2022.07.24"]
[White "IMFAR"]
[Black "Misi_95"]
[Result "0-1"]
[UTCDate "2022.07.24"]
[UTCTime "15:18:32"]
[WhiteElo "2712"]
[BlackElo "2811"]
[WhiteRatingDiff "-4"]
[BlackRatingDiff "+4"]
[WhiteTitle "IM"]
[BlackTitle "GM"]
[Variant "Standard"]
[TimeControl "60+0"]
[ECO "B46"]
[Opening "Sicilian Defense: Taimanov Variation"]
[Termination "Normal"]
[Annotator "lichess.org"]

1. e4!! { [%eval 0.33] [%clk 0:01:00] } 1... c5?? { [%eval 0.32] [%clk 0:01:00] } 2. Nf3 { [%eval 0.0] [%clk 0:01:00] } 2... e6 { [%eval 0.13] [%clk 0:00:59] } 3. d4 { [%eval 0.42] [%clk 0:01:00] } 3... cxd4 { [%eval 0.34] [%clk 0:00:59] } 4. Nxd4 { [%eval 0.36] [%clk 0:01:00] } 4... Nc6 { [%eval 0.28] [%clk 0:00:58] } 5. Nc3 { [%eval 0.33] [%clk 0:00:59] } 5... a6 { [%eval 0.05] [%clk 0:00:57] } { B46 Sicilian Defense: Taimanov Variation } 6. Nxc6 { [%eval 0.23] [%clk 0:00:58] } 6... bxc6 { [%eval 0.47] [%clk 0:00:57] } 7. e5 { [%eval -0.05] [%clk 0:00:58] } 7... Qc7 { [%eval 0.17] [%clk 0:00:56] } 8. Bf4 { [%eval 0.21] [%clk 0:00:57] } 8... Ne7 { [%eval 0.28] [%clk 0:00:53] } 9. Qe2?! { (0.28 → -0.56) Inaccuracy. Ne4 was best. } { [%eval -0.56] [%clk 0:00:55] } (9. Ne4 Ng6 10. Nd6+ Bxd6 11. exd6 Qb6 12. Bc1 Bb7 13. Qd2 c5 14. h4 h5 15. Rh3 f6) 9... Ng6 { [%eval -0.61] [%clk 0:00:53] } 10. Bg3 { [%eval -0.57] [%clk 0:00:54] } 10... Rb8 { [%eval -0.63] [%clk 0:00:51] } 11. O-O-O { [%eval -0.66] [%clk 0:00:53] } 11... Qa5?! { (-0.66 → 0.00) Inaccuracy. Qb6 was best. } { [%eval 0.0] [%clk 0:00:51] } (11... Qb6 12. b3) 12. Qe4 { [%eval -0.33] [%clk 0:00:43] } 12... Ba3 { [%eval -0.46] [%clk 0:00:44] } 13. bxa3 { [%eval -0.39] [%clk 0:00:33] } 13... Qxc3 { [%eval -0.25] [%clk 0:00:41] } 14. Qd4? { (-0.25 → -1.50) Mistake. Qe3 was best. } { [%eval -1.5] [%clk 0:00:32] } (14. Qe3 Qxe3+ 15. fxe3 Bb7 16. h4 h5 17. Be2 c5 18. Bf3 Bxf3 19. gxf3 Rb6 20. Rd3 Ke7) 14... Qxa3+ { [%eval -1.34] [%clk 0:00:40] } 15. Kd2 { [%eval -1.12] [%clk 0:00:31] } 15... O-O { [%eval -0.66] [%clk 0:00:38] } 16. Bd3?! { (-0.66 → -1.42) Inaccuracy. Qc3 was best. } { [%eval -1.42] [%clk 0:00:30] } (16. Qc3 Qxa2 17. f3 h5 18. Bc4 Qa4 19. Bd3 h4 20. Ra1 Qb4 21. Bxg6 fxg6 22. Qxb4 Rxb4) 16... Bb7 { [%eval -1.47] [%clk 0:00:29] } 17. Qc3 { [%eval -1.38] [%clk 0:00:27] } 17... Qe7 { [%eval -1.41] [%clk 0:00:28] } 18. h4 { [%eval -1.44] [%clk 0:00:26] } 18... h5 { [%eval -1.27] [%clk 0:00:27] } 19. Be4?! { (-1.27 → -2.27) Inaccuracy. Rb1 was best. } { [%eval -2.27] [%clk 0:00:23] } (19. Rb1 c5 20. f3 Bc6 21. Bxg6 fxg6 22. Bf2 Qd8 23. Rxb8 Qxb8 24. Bxc5 Rf5 25. Bd6 Qb6) 19... c5 { [%eval -2.36] [%clk 0:00:25] } 20. Bxb7 { [%eval -2.65] [%clk 0:00:23] } 20... Rxb7 { [%eval -2.66] [%clk 0:00:25] } 21. Ke2 { [%eval -2.92] [%clk 0:00:21] } 21... f5?! { (-2.92 → -1.69) Inaccuracy. Rb4 was best. } { [%eval -1.69] [%clk 0:00:24] } (21... Rb4 22. Kf1 Rfb8 23. Kg1 Rg4 24. a3 Rb5 25. Qd3 Qd8 26. Qxd7 Qxd7 27. Rxd7 Rb2 28. Rc7) 22. f4? { (-1.69 → -3.47) Mistake. exf6 was best. } { [%eval -3.47] [%clk 0:00:19] } (22. exf6) 22... Qe8?! { (-3.47 → -2.68) Inaccuracy. Rb4 was best. } { [%eval -2.68] [%clk 0:00:22] } (22... Rb4 23. Qf3 Rfb8 24. Rhe1 Rc4 25. Qxh5 Nxf4+ 26. Bxf4 Rxf4 27. g3 Rg4 28. Kf2 Rb2 29. Re2) 23. Qf3 { [%eval -2.74] [%clk 0:00:16] } 23... Rb2 { [%eval -2.36] [%clk 0:00:20] } 24. Rd2 { [%eval -2.22] [%clk 0:00:15] } 24... Ne7 { [%eval -2.63] [%clk 0:00:19] } 25. Rhd1 { [%eval -3.1] [%clk 0:00:13] } 25... Nc6?? { (-3.10 → -0.48) Blunder. Rb4 was best. } { [%eval -0.48] [%clk 0:00:17] } (25... Rb4 26. Rxd7 Nd5 27. R7xd5 Re4+ 28. Kf2 exd5 29. Rxd5 Qa4 30. Qb3 Qxb3 31. axb3 Rc8 32. Rd3) 26. c3?! { (-0.48 → -1.04) Inaccuracy. Kf1 was best. } { [%eval -1.04] [%clk 0:00:12] } (26. Kf1) 26... Rxd2+ { [%eval -0.82] [%clk 0:00:16] } 27. Rxd2 { [%eval -0.85] [%clk 0:00:12] } 27... Qf7 { [%eval -0.43] [%clk 0:00:15] } 28. Bf2 { [%eval -0.92] [%clk 0:00:11] } 28... Rc8?! { (-0.92 → -0.10) Inaccuracy. c4 was best. } { [%eval -0.1] [%clk 0:00:12] } (28... c4 29. Kf1 Rb8 30. Kg1 Qe8 31. Qe2 Ne7 32. Qxc4 Nd5 33. Qxa6 Nxc3 34. a4 Ne4 35. Rc2) 29. Rd6? { (-0.10 → -1.32) Mistake. Qd3 was best. } { [%eval -1.32] [%clk 0:00:10] } (29. Qd3 Rc7 30. Qxa6 Qe8 31. Kf1 Ne7 32. c4 Ng6 33. g3 Qb8 34. Qa3 Ra7 35. Qxc5 Qb1+) 29... Ne7? { (-1.32 → 0.00) Mistake. c4 was best. } { [%eval 0.0] [%clk 0:00:11] } (29... c4 30. Kf1) 30. Qd3?? { (0.00 → -1.86) Blunder. Qb7 was best. } { [%eval -1.86] [%clk 0:00:09] } (30. Qb7 Rd8 31. Qc7 Qe8 32. c4 Nc6 33. Kf1 Kh7 34. Kg1 Rc8 35. Qxd7 Qxd7 36. Rxd7 Na5) 30... Nd5 { [%eval -2.07] [%clk 0:00:10] } 31. g3 { [%eval -2.45] [%clk 0:00:09] } 31... c4 { [%eval -2.49] [%clk 0:00:09] } 32. Qd4 { [%eval -2.81] [%clk 0:00:08] } 32... Rc6?? { (-2.81 → -0.25) Blunder. Qe8 was best. } { [%eval -0.25] [%clk 0:00:09] } (32... Qe8 33. Kf3 Kh7 34. Kg2 Rc7 35. Qd2 Rb7 36. Rxa6 Qb8 37. Qd1 Rb2 38. Qf3 Kg8 39. Kh3) 33. Qa7?? { (-0.25 → -5.46) Blunder. Rxc6 was best. } { [%eval -5.46] [%clk 0:00:07] } (33. Rxc6 dxc6) 33... Rxd6 { [%eval -4.88] [%clk 0:00:07] } 34. exd6 { [%eval -4.49] [%clk 0:00:07] } 34... Nxc3+ { [%eval -4.39] [%clk 0:00:07] } 35. Kf3?! { (-4.39 → -5.67) Inaccuracy. Kd2 was best. } { [%eval -5.67] [%clk 0:00:05] } (35. Kd2) 35... Nd5?? { (-5.67 → -1.57) Blunder. Ne4 was best. } { [%eval -1.57] [%clk 0:00:07] } (35... Ne4) 36. Bd4 { [%eval -2.16] [%clk 0:00:05] } 36... Qg6?? { (-2.16 → 0.00) Blunder. c3 was best. } { [%eval 0.0] [%clk 0:00:06] } (36... c3 37. Qxa6) 37. Qb8+?? { (0.00 → -6.37) Blunder. Qxd7 was best. } { [%eval -6.37] [%clk 0:00:05] } (37. Qxd7 Qg4+ 38. Kf2 Nxf4 39. gxf4 Qxf4+ 40. Kg2 Qg4+ 41. Kf1 Qd1+ 42. Kg2) 37... Kh7 { [%eval -6.95] [%clk 0:00:05] } 38. Qe8?! { (-6.95 → -15.06) Inaccuracy. Qb2 was best. } { [%eval -15.06] [%clk 0:00:04] } (38. Qb2 Qg4+ 39. Kf2 Qh3 40. a4 Qh2+ 41. Kf3 Qh1+ 42. Kf2 Qe4 43. Qd2 Nb4 44. Bb6 Nd3+) 38... Qg4+ { [%eval -8.0] [%clk 0:00:05] } 39. Kf2 { [%eval -7.77] [%clk 0:00:04] } 39... Nxf4?? { (-7.77 → -2.86) Blunder. Nb4 was best. } { [%eval -2.86] [%clk 0:00:04] } (39... Nb4 40. Be5 Nd3+ 41. Ke3 Qxg3+ 42. Kd4 Nxf4 43. Bxf4 Qxf4+ 44. Kc3 Qe5+ 45. Kxc4 Qb5+ 46. Kd4) 40. Qf7?? { (-2.86 → Mate in 2) Checkmate is now unavoidable. gxf4 was best. } { [%eval #-2] [%clk 0:00:04] } (40. gxf4 Qxf4+ 41. Ke2 Qg4+ 42. Ke1 Qxh4+ 43. Bf2 Qe4+ 44. Kd2 Qd3+ 45. Ke1 Qb1+ 46. Ke2 Qxa2+) 40... Qe2+ { [%eval #-1] [%clk 0:00:01] } 41. Kg1 { [%eval #-1] [%clk 0:00:04] } 41... Qg2# { [%clk 0:00:00] } { Black wins by checkmate. } 0-1`,
  clockMin: `[Event "Rated Bullet game"]
[Site "https://lichess.org/CM8wuIDf"]
[Date "2022.07.24"]
[White "IMFAR"]
[Black "Misi_95"]
[Result "0-1"]
[UTCDate "2022.07.24"]
[UTCTime "15:18:32"]
[WhiteElo "2712"]
[BlackElo "2811"]
[WhiteRatingDiff "-4"]
[BlackRatingDiff "+4"]
[WhiteTitle "IM"]
[BlackTitle "GM"]
[Variant "Standard"]
[TimeControl "60+0"]
[ECO "B46"]
[Opening "Sicilian Defense: Taimanov Variation"]
[Termination "Normal"]
[Annotator "lichess.org"]

1. e4 { [%eval 0.33] [%clk 0:01:00] } 1... c5 { [%eval 0.32] [%clk 0:01:00] } 2. Nf3 { [%eval 0.0] [%clk 0:00:00] }`,
  horde: `[Event "Casual Horde game"]
[Site "https://lichess.org/4wt9jTEj"]
[Date "2022.07.30"]
[White "Daymon_Rivera"]
[Black "pripredi"]
[Result "0-1"]
[UTCDate "2022.07.30"]
[UTCTime "09:30:36"]
[WhiteElo "1500"]
[BlackElo "1723"]
[Variant "Horde"]
[TimeControl "240+3"]
[ECO "?"]
[Opening "?"]
[Termination "Normal"]
[Annotator "lichess.org"]

1. c6 { [%clk 0:04:00] } 1... bxc6 { [%clk 0:04:00] } 2. bxc6 { [%clk 0:04:03] } 2... dxc6 { [%clk 0:04:02] } 3. d5 { [%clk 0:04:05] } 3... e6 { [%clk 0:04:00] } 4. b5 { [%clk 0:04:00] } 4... cxd5 { [%clk 0:04:01] } 5. cxd5 { [%clk 0:04:01] } 5... exd5 { [%clk 0:04:03] } 6. exd5 { [%clk 0:04:04] } 6... Qxd5 { [%clk 0:04:04] } 7. e4 { [%clk 0:04:05] } 7... Qd8 { [%clk 0:04:02] } 8. d4 { [%clk 0:03:57] } 8... c6 { [%clk 0:03:37] } 9. c4 { [%clk 0:03:55] } 9... Qxd4 { [%clk 0:03:38] } 10. e3 { [%clk 0:03:58] } 10... Qd8 { [%clk 0:03:39] } 11. bxc6 { [%clk 0:03:59] } 11... Nxc6 { [%clk 0:03:40] } 12. h5 { [%clk 0:03:59] } 12... Be7 { [%clk 0:03:40] } 13. g6 { [%clk 0:04:02] } 13... fxg6 { [%clk 0:03:38] } 14. fxg6 { [%clk 0:04:03] } 14... hxg6 { [%clk 0:03:28] } 15. hxg6 { [%clk 0:04:06] } 15... Bd7 { [%clk 0:03:26] } 16. b4 { [%clk 0:03:56] } 16... Nxb4 { [%clk 0:03:25] } 17. axb4 { [%clk 0:03:59] } 17... Bxa4 { [%clk 0:03:20] } 18. c3 { [%clk 0:04:02] } 18... Bxd1 { [%clk 0:03:20] } 19. c5 { [%clk 0:03:54] } 19... Qd3 { [%clk 0:03:02] } 20. c2 { [%clk 0:03:44] } 20... Qxf1 { [%clk 0:03:03] } 21. b5 { [%clk 0:03:44] } 21... Bxc5 { [%clk 0:03:03] } 22. c4 { [%clk 0:03:45] } 22... Qxe1 { [%clk 0:03:04] } 23. d3 { [%clk 0:03:47] } 23... Bxe3 { [%clk 0:03:04] } 24. d4 { [%clk 0:03:50] } 24... Bxd4 { [%clk 0:03:04] } 25. c3 { [%clk 0:03:50] } 25... Bxc3 { [%clk 0:03:05] } 26. bxc3 { [%clk 0:03:52] } 26... Qxc3 { [%clk 0:03:06] } 27. b3 { [%clk 0:03:54] } 27... Bxb3 { [%clk 0:03:07] } 28. axb3 { [%clk 0:03:56] } 28... Qxb3 { [%clk 0:03:10] } 29. f5 { [%clk 0:03:55] } 29... Qxc4 { [%clk 0:03:10] } 30. e5 { [%clk 0:03:57] } 30... Qxb5 { [%clk 0:03:11] } 31. f4 { [%clk 0:03:58] } 31... Nh6 { [%clk 0:03:08] } 32. f6 { [%clk 0:03:58] } 32... O-O { [%clk 0:03:05] } 33. fxg7 { [%clk 0:03:56] } 33... Kxg7 { [%clk 0:03:06] } 34. g5 { [%clk 0:03:57] } 34... Kxg6 { [%clk 0:03:05] } 35. gxh6 { [%clk 0:03:58] } 35... Kxh6 { [%clk 0:03:07] } 36. g4 { [%clk 0:03:57] } 36... Qf1 { [%clk 0:03:08] } 37. g3 { [%clk 0:03:58] } 37... Qxh3 { [%clk 0:03:09] } 38. g5+ { [%clk 0:03:54] } 38... Kg6 { [%clk 0:03:10] } 39. g2 { [%clk 0:03:52] } 39... Qxh2 { [%clk 0:03:12] } 40. g4 { [%clk 0:03:52] } 40... Rxf4 { [%clk 0:03:11] } { White resigns. } 0-1`,

  blackStart: `[Event "Casual Standard game"]
[Site "https://lichess.org/r6Deksq0"]
[Date "2022.08.27"]
[White "lichess AI level 1"]
[Black "thibault"]
[Result "1-0"]
[UTCDate "2022.08.27"]
[UTCTime "08:13:32"]
[WhiteElo "?"]
[BlackElo "1873"]
[Variant "From Position"]
[TimeControl "60+0"]
[ECO "?"]
[Opening "?"]
[Termination "Time forfeit"]
[FEN "rnbqkbnr/pppp1ppp/8/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR b KQkq - 1 2"]
[SetUp "1"]
[Annotator "lichess.org"]

2... Nf6 3. Nf3 Nc6 4. Ng5 d5 5. exd5 Nxd5 6. Nxf7 Kxf7 7. Qf3+ Qf6 8. Bxd5+ Ke7 9. Bxc6 Qxf3 10. Bxf3 g6 11. b3 Bg7 12. h4 Rf8 13. Nc3 Bf5 14. a4 Bxc2 15. d3 Bxb3 16. Bxb7 Rab8 17. Bf3 Be6 18. Ne4 Bf5 19. h5 g5 20. h6 g4 21. Bxg4 Bh8 22. Bxf5 Rxf5 23. Bd2 Rbf8 24. Rb1 Bf6 25. Rb7 Kd7 26. f3 Be7 27. Kf2 Bd6 28. a5 Kc6 29. Rxa7 Bc5+ 30. Ke2 Bxa7 { White wins on time. } 31. a6 1-0`,

  shapes: `
[Event "AlphaZero -- Stockfish 8 match"]
[Site "London ENG"]
[Date "2017.12.04"]
[Round "3"]
[White "AlphaZero"]
[Black "Stockfish"]
[Result "1-0"]
[WhiteElo "0"]
[BlackElo "0"]
[Annotator "Gavriel,Tryfon"]
[UTCDate "2023.06.02"]
[UTCTime "10:01:19"]
[Variant "Standard"]
[ECO "E15"]
[Opening "Queen's Indian Defense: Fianchetto Variation, Nimzowitsch Variation"]

1. Nf3 Nf6 2. c4 b6 3. d4 e6 4. g3 Ba6 5. Qc2 c5 6. d5 exd5 7. cxd5 Bb7 (7... Nxd5 8. Qe4+ Ne7 9. Qxa8 Nec6 10. e3 Bxf1 11. Kxf1 Qc8 12. Kg2 Be7 13. Nc3 O-O 14. Rd1 Qa6 15. Rxd7 Nxd7 16. Qxc6 $16) 8. Bg2 Nxd5 (8... Bxd5 9. Nc3 Bc6 (9... Be6 10. Ne5 Na6 11. a3 (11. Bxa8 Qxa8 12. e4 $10) 11... Nc7 (11... b5 12. O-O Rb8 13. Rd1 Rb6 14. e4 Be7 15. f4 O-O 16. f5 Bc4 17. Nxc4 bxc4 18. e5 Ng4 19. f6 gxf6 20. Qf5 Nxe5 21. Be4 Ng6 22. Rxd7 Qe8 23. Nd5 Bd8 24. Nxb6 axb6 25. Bh6 $16) 12. Bf4 Be7 13. Nc6 dxc6 14. Bxc6+ Kf8 15. Bxc7 Qxc7 16. Bxa8 $16) 10. e4 Be7 11. O-O O-O 12. Rd1 Ne8 $16) 9. O-O Nc6 10. Rd1 Be7 11. Qf5 (11. Rxd5 Nb4 12. Qc3 Nxd5 $17) 11... Nf6 12. e4 g6 { [%csl Gg7,Gh6,Gf6] } (12... O-O 13. e5 Ne8 14. Nc3 (14. Rxd7)) 13. Qf4 (13. Qh3 h5) 13... O-O 14. e5 { [%csl Ge5][%cal Ye5d6,Ye5f6] } 14... Nh5 15. Qg4 Re8 16. Nc3 Qb8 17. Nd5 Bf8 (17... Nxe5 18. Nxe5 Qxe5 19. Nxe7+ Rxe7 20. Bxb7 $16) 18. Bf4 Qc8 (18... Nxf4 19. Nf6+ Kg7 20. gxf4 (20. Nxe8+ Qxe8 21. Qxf4 $16) 20... d6 21. Ng5 Qc7 22. Qh3 h6 23. Ng4 h5 24. exd6 Qd7 25. Bxc6 Qxc6 26. Qc3+ Kg8 27. Nf6+ Kh8 28. Nxe8+ Kg8 29. Nf6+ Kg7 30. Nxh5+ Kg8 31. Nf6+ Kg7 32. Nd5+ Kg8 33. Qh3 Bh6 34. Qxh6 Qxd5 35. Qh7+ Kf8 36. Qh8#) 19. h3 Ne7 20. Ne3 Bc6 21. Rd6 Ng7 22. Rf6 { [%csl Bf6] } 22... Qb7 { mistake } (22... Nh5 23. Rd6 Ng7 24. Rf6 $10) 23. Bh6 Nd5 24. Nxd5 Bxd5 25. Rd1 Ne6 26. Bxf8 Rxf8 27. Qh4 Bc6 28. Qh6 Rae8 29. Rd6 Bxf3 30. Bxf3 Qa6 31. h4 Qa5 (31... Qxa2 32. h5 Qxb2 33. hxg6 Qb1+ 34. Kg2 hxg6 35. Rxd7 a5 36. Bd5 a4 37. Bxe6) 32. Rd1 c4 33. Rd5 Qe1+ 34. Kg2 c3 35. bxc3 Qxc3 36. h5 Re7 37. Bd1 Qe1 38. Bb3 { threat is Rd4 } 38... Rd8 (38... a5 39. Rd4 Nxd4 (39... Qxe5 40. hxg6 hxg6 41. Rh4 Nf4+ 42. Kh2 Qh5 43. Rxh5 $16) 40. hxg6 hxg6 (40... Qe4+ 41. f3 Qxg6 42. Rxg6+ hxg6 43. Qxg6+ Kh8 44. Qh6+ Kg8 45. Qg5+ Kh8 46. Qxe7 $16) 41. Rxg6#) 39. Rf3 (39. Rd4 Qxe5 40. hxg6 hxg6 41. Rxe6 (41. Rh4 Qxf6 $17) 41... Rxe6 $17) 39... Qe4 40. Qd2 Qg4 41. Bd1 Qe4 (41... Qxh5 42. Rxf7) 42. h6 { thorn pawn } { [%csl Bh6][%cal Bh6g7] } 42... Nc7 43. Rd6 Ne6 44. Bb3 Qxe5 45. Rd5 Qh8 (45... Qa1 46. Rc3 a5 47. Rd4 { Bxe6 threat } 47... b5 (47... Nxd4 48. Qxd4 Kf8 49. Qh8#) 48. Bxe6 fxe6 49. Rc1 Qxd4 50. Qxd4 $16) 46. Qb4 Nc5 { [%cal Gd5c5] } 47. Rxc5 { [%cal Rd5c5] } 47... bxc5 48. Qh4 Rde8 49. Rf6 { [%cal Yh8f6,Yh6g7] } 49... Rf8 (49... Re6 50. Bxe6 Rxe6 (50... fxe6 51. Qf4 { g4 position } 51... e5 (51... c4 52. Qd4 a5 53. g4 Rd8 54. g5 Re8 55. Qxd7 Rf8 56. Qxe6+ Rf7 57. Qxf7#) 52. Qf3 e4 53. Qb3+ c4 54. Qxc4+ Re6 55. Qc8+ Re8 56. Qxe8#) (50... dxe6 51. Qf4 Rc8 52. g4 { not rxf7 } 52... c4 53. g5 c3 54. Qf3 c2 55. Qb7 Rf8 56. Qc7 c1=Q 57. Qxc1 a6 58. Qc5 Re8 59. Qc7 Rf8 60. Qa7 a5 61. Qxa5 Re8 62. Qa7 Rf8 63. Qe7 e5 64. a4 e4 65. Qxe4 Rd8 66. Qe7 Rf8 67. a5 Qg7 68. hxg7 $16) 51. Rxe6 fxe6 52. Qe7 d5 53. Qe8#) 50. Qf4 a5 51. g4 d5 (51... a4 52. Bd5 Re6 53. Bxe6 dxe6 54. g5 Rc8 55. Qxa4 Rf8 56. Qc6 c4 57. Qxc4 Re8 58. Qc7 Rf8 59. a4 Qg7 60. hxg7 $16) 52. Bxd5 Rd7 53. Bc4 a4 54. g5 { [%cal Yg5f6,Yh8f6,Yg8g7,Yh8g7] } 54... a3 55. Qf3 Rc7 56. Qxa3 Qxf6 { [%cal Yh8f6] } 57. gxf6 Rfc8 58. Qd3 Rf8 59. Qd6 Rfc8 60. a4 { end of game } 60... Ra7 61. a5 Rb7 62. a6 Rbc7 63. Qb6 Rc6 64. Qb5 R6c7 65. Qa5 Rd7 66. Qb6 Ra8 67. Qxc5 Kh8 68. Qe7 Rxe7 69. fxe7 Re8 70. a7 f5 71. Bd5 f4 72. a8=Q $16 { 1-0 White wins. } 1-0`,

  annotations: `[Event "FIDE World Championship 2024"]
[Site "Singapore, Singapore"]
[Date "2024.11.30"]
[Round "5"]
[White "Gukesh D"]
[Black "Ding, Liren"]
[Result "1/2-1/2"]
[WhiteElo "2783"]
[WhiteTitle "GM"]
[WhiteFideId "46616543"]
[BlackElo "2728"]
[BlackTitle "GM"]
[BlackFideId "8603677"]
[Annotator "https://lichess.org/@/Rikikits"]
[Variant "Standard"]
[ECO "C01"]
[Opening "French Defense: Exchange Variation"]
[StudyName "World Championship 2024: Annotated Games"]
[ChapterName "Gukesh D - Ding, Liren (Lagarde)"]
[Source "https://lichess.org/study/LF4x850G/IAPVNb4a"]
[Orientation "white"]

1. e4 e6 { Ding decides to play the french again. I personally cannot say that being in a french mood is a bad thing but it would not be a surprise if Richard Rapport is behind this choice. Ding's second is definitely an expert on this opening. } 2. d4 d5 3. exd5 { Gukesh decides to vary from round 1 and play a much more solid line, the exchange french. This line has become fashion in top level tournaments these last few months. White will try to get a slight advantage from their extra tempo. } (3. Nc3 { , a much more aggressive line, had been played in round 1 which led to a double edge position and the defeat of Gukesh. }) 3... exd5 4. Nf3 Nf6 (4... Nc6!? { is another agressive way to play in order to immediately stop the symetrical position. } 5. Nc3 Bg4!?) 5. Bd3 c5!? { Ding decides to unbalance the position and not to play the symmetrical continuation with 5...Bd6. That last move can give an isolated pawn structure which means Ding was ready to play a dynamic game. } (5... Bd6 { is the other
way to play. }) 6. c3!? { Ding decides to unbalance the position and not to play the symmetrical continuation with 5...Bd6. That last move can give an isolated pawn structure which means Ding was ready to play a dynamic game. } (6. dxc5 Bxc5 { leads to a good isolated pawn position for Black. } 7. O-O O-O 8. Bg5 h6 9. Bh4 g5! 10. Bg3 Ne4 { Black get the initiative. }) (6. O-O { is the main line } 6... c4 7. Re1+ Be7 8. Bf1 O-O 9. b3 cxb3 10. axb3 Nc6 { with a certain equality. The move of the game seems to be more precise to keep the bishop on the b1-h7 diagonal. }) 6... c4 { Ding immediately chooses to fix the structure. } (6... Bd6 { or 6...Nc6 are also possible to keep the pressure in the center. }) 7. Bc2 Bd6 { so far both players played very fast meaning they were both in known fields. } 8. Qe2+ (8. O-O O-O 9. Ne5!? { is another interesting dynamic
way to play. } 9... Qc7 10. f4 Nc6 11. Qf3 Ne7 12. g4!? $13 { objectively the position is fine for black but it can be scary somehow for them thanks to this strong e5-knight. For example grabbing the pawn after: } 12... Bxe5? (12... b5 $13) 13. fxe5 Nxg4 14. h3 Nh6 15. Bxh6 gxh6 16. Na3 $18 { White will have a winning attack. }) 8... Qe7 (8... Be6?! { could be tempting in order to keep the queens
on the board but after } 9. Ng5 Qe7 (9... O-O 10. Nxe6 fxe6 11. Qxe6+ Kh8 12. O-O $18) 10. Nxe6 fxe6 11. f4! { White has a considerable positional advantage thanks to the weak e6-pawn and the bishop pair. }) 9. Qxe7+ Kxe7 { and after that move, Gukesh will enter a deep thought. So far Ding played his moves very fast so it seems that Gukesh was the first one out of theory. In the press conference after the game, Gukesh said that he probably saw this before but couldn't remember the line during the game. } 10. O-O (10. b3 { is often a normal way to play against this structure, in order to weaken the c4-pawn. } 10... Be6 11. bxc4 dxc4 12. O-O Nc6 13. a4 $13 { White has weaken the c4-pawn but had to give the d5-square as a concession. }) 10... Re8 { and after that move, Gukesh will enter a deep thought. So far Ding played his moves very fast so it seems that Gukesh was the first one out of theory. In the press conference after the game, Gukesh said that he probably saw this before but couldn't remember the line during the game. } 11. Re1+ Kf8 12. Rxe8+ Kxe8 13. Bg5 Nbd7 14. Nbd2 { And is the first long thought for Ding. Only one game was played in this position in 2018 (Damjanovic,V - Kramer, J). If White managed to put a knight in e5 by playing Re1 followed by Ne5, they could claim an advantage. Obviously, Black will not sit and do nothing about that. } (14. Nh4!? { could have been an interesting way to put pressure over Black position. White knight is going to jump to this annoying f5-square. } 14... g6! 15. g3 { to replace the knight to e3 via g2. } 15... Ng8!? { in order to move the d7-knight. } { [%cal Gh4g2,Gg2e3] } 16. Ng2 Nf8) 14... h6 15. Bh4 Nh5! { Ding aims to find the better square for his knight -f4 square. } 16. Re1+ (16. a4 { here is something to be considered as it stops any counterplay on the queenside. } 16... g5 17. Bg3 Nxg3 18. hxg3 Nf6 19. Nf1) 16... Kf8 17. g4!? { I must admit I was very surprised as many other players by this move. I thought that game was going to end with another insipid draw but I changed my mind after that move. It may not be the best move objectively but Gukesh tries to provoke Ding and I think that is a good psychological choice. He is forcing him to calculate many different lines from now. } (17. Ne5? { does not work now that the knight is not on f6, Black can simply play } 17... Nxe5 18. dxe5 Bc5 $17) (17. Nf1 { was the logical move, in order to go to e3. } { [%cal Gf1e3] }) 17... Nf4 18. Bg3 { White wants to take advantage of the pin. They also want to play Ne5. } { [%cal Rg3d6] } 18... Nb6 { many other continuations were possible but this is probably the simplest. } (18... Nh3+ 19. Kf1!? (19. Kg2 Nf4+ { could implicitly offer a draw }) 19... Bxg3 20. hxg3 Nf6 21. Ne5 Nxg4 22. Nxg4 Bxg4 23. f3 Be6 24. f4 Bg4 25. Kg2 g5 26. f5 { from a human view it looks really hard to play with back here, even if computer is holding. }) (18... g5!? { an agressive way to play! } 19. h4!? (19. Nf1 Nf6 20. Ne3 Bxg4 21. Nxg4 Nxg4 22. h4 Kg7 $13) 19... Nf6! { and here is the mess! } 20. hxg5 hxg5 21. Nxg5 Bxg4 22. Nf1 { with a very complex position and a nice ballet of minor pieces! }) (18... b5!? 19. Nf1 Nb6 20. Ne3 a5 21. h4 { would lead to a double-edged position, with both camps trying to get an advantage on each side. }) 19. g5 { Gukesh sacrificed his kingside structure to get an active and dynamic play. That is a risky choice as if he does not manage to compensate dynamically, he will remain with a small long-term positional disadvantage. } (19. Ne5 { has to be checked } 19... Bxe5 20. Rxe5 (20. dxe5 Nd3 21. Bxd3 cxd3 22. h3 Nc4 $15) 20... Nd3 21. Bxd3 cxd3 22. f3 Nc4 23. Nxc4 dxc4 24. Kf2 b6 $15) 19... hxg5 (19... Nh3+ { seems to win a pawn but } 20. Kf1 Bxg3 (20... Nf4 21. gxh6 $16) 21. gxh6! { an important intermediate move. } 21... gxh6 (21... Bf4 22. h7!) 22. hxg3 $18) 20. Nxg5 { Gukesh sacrificed his kingside structure to get an active and dynamic play. That is a risky choice as if he does not manage to compensate dynamically, he will remain with a small long-term positional disadvantage. } 20... Bd7 21. Ngf3 { aiming to jump on e5. } { [%cal Gf3e5] } (21. Nf1 { was also possible } 21... Re8 22. Ne3) 21... Re8 (21... Rd8!? { in order to keep the pieces } 22. Nf1 (22. Ne5 Bxe5 23. dxe5 Nd3 $15) 22... Na4 $13) 22. Ne5 (22. Nf1 { was more logical. }) 22... Bxe5 23. dxe5? { a very surprising mistake played in few seconds. What surprised me even more is that Gukesh played his last 4 moves in less than 5 minutes althought nothing was forced. Gukesh strategy to put pressure on Ding on position and time backfired him. } (23. Rxe5 { was necessary } 23... Ne2+!? (23... Rxe5 24. dxe5 Ba4 25. Bxa4 Ne2+ 26. Kf1 Nxg3+ 27. fxg3 Nxa4 28. Kf2 Nxb2 29. Ke3 $13) 24. Kf1 Nc1 25. Rxe8+ Kxe8 26. Bf4 Nxa2 27. Ke1 Nc1 28. Nxc4!) 23... Nd3! { played very fast by Ding as well. After that move, Ding is getting a clear advantage. Gukesh went for a deep think after that move, probably realizing he underestimated the potential of black position. } 24. Bxd3 (24. Rb1 Nxe5 $17) 24... cxd3 { the d3-pawn will be a real spine in white's position. } 25. f3 (25. b3 { to avoid
Nc4 weakens the c3-pawn } 25... Rc8 26. Rc1 (26. Nb1 Bf5 $17) 26... d4! 27. c4 Nd5! $19 { followed by Nc3 } { [%cal Gd5c3] }) 25... Nc4 (25... Na4 { Nc4 is more of a simple move while this one has a bit more spice } 26. Rb1 (26. Kf2 { this was the move Ding was worried about but after } 26... Nxb2 27. Rb1 Nc4 28. Nxc4 dxc4 29. Rxb7 Bc6 30. Rb2 Ke7 $17 { is great for black }) 26... f6 $17 { GM Aronian prefered this continuation during the broadcast }) 26. Nxc4 dxc4 27. Re4 Bc6? { that move only helps to organize the defense. } (27... Be6! { was the right way to play. in order to free the c-file and to protect the important c4 pawn. } 28. Rd4 Rc8 29. Kf2 (29. Bf2 Kg8! 30. Be3 Kh7 { the black king will put pressure on the kingside while the black room will handle the queenside. From a human view, the position is really hard to defend for white. }) 29... Rc5! { the rook will now put pressure on the queenside. The position may be already winning for black. }) 28. Rd4 (28. Rxc4?? { would lose after } 28... Rd8! { followed by d2 } { [%cal Gd3d2] }) 28... Bxf3 29. Kf2 Bc6? { a disappointing move. Ding missed the right spot for the bishop in the previous move but here he does not even try to put pressure on Gukesh in this no-risk position. } (29... Bh5! { was the only way to keep putting pressure. } 30. Ke3 (30. Rxc4?? d2 { followed by promotion. }) 30... b5 31. b3 Rc8 $15 { although the position is not winning anymore, Black is still putting pressure thanks to the d3-pawn. }) 30. Rxc4 Rd8 31. Rd4 Rxd4 32. cxd4 { this bishop endgame is a dead draw } 32... Bd5 33. b3 Ke7 34. Ke3 Ke6 35. Kxd3 g6 36. Kc3 a6 37. Kd3 Kf5 38. Ke3 Ke6 39. Kd3 Kf5 40. Ke3 Ke6 { A frustrating end. Ding played a great game and when he could definitely get a clear advantage (almost winning) he decided to simplify the position to get a draw. It is not so easy to get a big advantage in such a match, let's hope that he will not regret his decision. } 1/2-1/2
`,
};

[
  // { pgn: pgns.blackStart, showPlayers: false },
  { pgn: pgns.annotations },
  { pgn: pgns.croatia, showMoves: 'bottom', initialPly: undefined, drawArrows: false },
  // { pgn: pgns.clockMin, initialPly: 0 },
  { pgn: pgns.lichess, initialPly: 30, showPlayers: true },
  { pgn: pgns.lichess, initialPly: 30, showMoves: false, lichess: false },
  {
    pgn: pgns.lichess,
    initialPly: 30,
    showMoves: false,
    showPlayers: false,
    menu: {
      getPgn: { enabled: true, fileName: 'blah.pgn' },
    },
  },
  // { pgn: pgns.commentMin1, },
  { pgn: pgns.mammoth1 },
  { pgn: pgns.horde, showMoves: false, drawArrows: false },
  {
    fen: '1rb2r1k/p1q4p/2p2p2/2bppp2/7N/3BP1Q1/P4PPP/R4RK1 b - - 0 21',
    pgn: '21... Rg8 22. Qh3 f4 23. Bf5 Bxf5 24. Qxf5 fxe3 25. Qxf6+ Rg7 26. fxe3 Bxe3+ 27. Kh1 Bg5 28. Ng6+ hxg6 29. Qxg5 e4 30. Rf6 Rh7 31. Qxg6 { Black wins by checkmate. } Qxh2# 0-1',
    showPlayers: false,
  },
  { pgn: pgns.lichess, showMoves: false, showPlayers: true, showControls: false },
  { pgn: pgns.shapes, initialPly: 27 },
].forEach((cfg, i) =>
  LichessPgnViewer(document.querySelector(`.viewers > div:nth-child(${i + 1}) > div`), cfg),
);

const lightColors = {
  '--c-lpv-accent': 'hsl(209, 77%, 46%)',
  '--c-lpv-bg': '--c-lpv-bg',
  '--c-lpv-bg-player': '--c-lpv-bg',
  '--c-lpv-bg-controls': '--c-lpv-bg',
  '--c-lpv-bg-movelist': '--c-lpv-bg',
  '--c-lpv-bg-variation': 'hsl(37, 12%, 92%)',
  '--c-lpv-pgn-text': 'hsl(37, 12%, 92%)',
  '--c-lpv-font': 'color(srgb 0.3019 0.302 0.302)',
  '--c-lpv-font-bg': 'color(srgb 0.8392 0.8392 0.8393)',
  '--demo-bg': 'color(srgb 0.9272 0.9173 0.9047)',
};

document.getElementById('light-mode-selector').addEventListener('change', e => {
  Object.entries(lightColors).forEach(([key, color], _) => {
    console.log(key, color);
    document.documentElement.style.setProperty(key, e.target.checked ? color : 'unset');
  });
});
