# In a nutshell
Provide the (type) language for all the `pgn-*` packages I am developing.

I have tried to develop parts of the pgn-* packages individually, and to import what is needed. By extracting now `pgn-writer` (that uses types in part defined by `pgn-parser`, part by `pgn-reader`) it gets more and more complicated.

To avoid having duplication of the  types (by doing copy and paste), I try now to eliminate duplicates and move them to the common types used in many packages. The size should be minimal (only declaration), but perhaps I gain a common model where the small glitches that are not easy to find can be avoided.

And yes, I will have additional dependencies that has to be managed, with some more changes if types / design changes. But better to have it explicit instead of subtle errors ...
