#set page(height: 3.5in, width: 2.5in, margin: 0.15in)
#set align(center)
#set text(font: "Cinzel", size: 12pt)

#let unit-type = json("../unit-card-data.json").unitType

#v(1fr)
#text(size: 16pt, weight: "bold")[#unit-type.name]
#v(0.25in)
#text(size: 10pt)[
  Cost: #unit-type.cost \
  Limit: #unit-type.limit \
  Rout Penalty: #unit-type.routPenalty
]
#v(1fr)
