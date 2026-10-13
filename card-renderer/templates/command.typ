// Command card face.
//
// The page is the trim size, plus an eighth-inch bleed when details.json
// asks for it. Bands painted under the trim continue into that margin so a
// wandering cut still shows the right field.

#let trim-width = 2.5in
#let trim-height = 3.5in
#let bleed = if json("../details.json").bleed { 0.125in } else { 0pt }

#set page(
  width: trim-width + 2 * bleed,
  height: trim-height + 2 * bleed,
  margin: 0pt,
)
#set align(center)
#set image(fit: "contain")

#let card = json("../command-card-data.json").card

// Palette. Display type is white. The art field is ivory.
// Range figures and round-effect type are bronze; labels are muted.
#let c-light = color.oklch(100%, 0.0, 0deg)
#let c-umber = color.oklch(17%, 0.04, 92deg)
#let c-bronze = color.oklch(66.37%, 0.0711, 84.05deg)
#let c-roundfx = color.oklch(28%, 0.027, 45deg)
#let c-oxblood = color.oklch(32%, 0.075, 25deg)
#let c-ivory = color.oklch(83%, 0.033, 79deg)
#let c-muted = color.oklch(65%, 0.032, 81deg)

#set text(font: "TeX Gyre Pagella", size: 9pt)

// Icons live at the render-workspace root, one directory above this file.
#let show-icon(icon-name, color) = image(
  "../icons/" + color + "/" + icon-name + "-" + color + ".svg",
)

#let display-text(content, size: 12pt) = text(
  font: "Cinzel",
  size: size,
  fill: c-light,
  content,
)

#let capitalize(word) = upper(word.at(0)) + word.slice(1)

// Trait ids are lowercase words. The face shows them as one title-case phrase,
// whether the card requires every trait or supports a single one.
#let trait-phrase(traits) = traits.map(capitalize).join(" ")

#let number-sign(number) = if number < 0 { "–" } else { "+" }

// Centers a piece on the surrounding text's cap-height midline.
// em is the surrounding text size, so the call stays outside any size change.
#let on-midline(body) = box(baseline: 50% - 0.35em, body)

// Commit icons are stat names. The schema allows one or two.
#let first-commit-icon = card.modifiers.at(0)
#let second-commit-icon = card.modifiers.at(1, default: none)

// "1 Unit Moves" / "4 Units Move". The leading space sits on the noun and
// the verb so the pieces concatenate without a join.
#let command-phrase(command) = {
  let singular = command.number == 1
  let noun = if command.size == "lines" {
    if singular { " Line" } else { " Lines" }
  } else {
    if singular { " Unit" } else { " Units" }
  }
  let verb = if command.type == "rangedAttack" {
    if singular { " Shoots" } else { " Shoot" }
  } else {
    if singular { " Moves" } else { " Move" }
  }
  str(command.number) + noun + verb
}

// "with" only when the command itself carries modifiers.
#let command-with(modifiers) = if modifiers.len() > 0 {
  text(size: 7pt, fill: c-light, " with ")
}

// A restriction is a range plus at most one filter. -1 means no range.
// Traits are one phrase (the unit must have all of them). Unit types are
// one row each (the unit must be one of them). Those strings are already
// display names; the print step swapped ids before this file runs.
#let restriction-view(restrictions) = {
  let range = if restrictions.inspirationRangeRestriction < 0 {
    none
  } else {
    restrictions.inspirationRangeRestriction
  }
  let labels = if restrictions.restrictionType == "trait" {
    (trait-phrase(restrictions.traitRestrictions),)
  } else if restrictions.restrictionType == "unitType" {
    restrictions.unitRestrictions.map(smallcaps)
  } else {
    ()
  }
  (range: range, labels: labels)
}

#let signed-value(modifier, text-size, sign-color) = on-midline(text(
  size: text-size,
  fill: sign-color,
  number-sign(modifier.value) + str(calc.abs(modifier.value)),
))

#let modifier-icon(modifier, icon-size, icon-variant) = on-midline(box(
  height: icon-size,
  width: icon-size,
  inset: 1pt,
  show-icon(modifier.type, icon-variant),
))

#let inline-modifiers(
  modifiers,
  text-size,
  icon-size,
  sign-color,
  icon-variant,
) = {
  if modifiers.len() == 0 {
    return none
  }
  let marks = modifiers.map(modifier => {
    signed-value(modifier, text-size, sign-color)
    modifier-icon(modifier, icon-size, icon-variant)
  })
  box(marks.join(" "))
}

// One rounded box for whatever this restriction uses: the filter and the
// range, side by side. Sized to its content. None when both are absent.
#let restriction-box(view) = {
  let filter = if view.labels.len() > 0 {
    text(fill: c-muted, size: 7pt, stack(spacing: 4pt, ..view.labels))
  }
  let range = if view.range != none {
    text(fill: c-bronze, size: 10pt, {
      str(view.range)
      h(2pt)
      on-midline(box(height: 1.4em, show-icon("commander", "bronze")))
    })
  }
  let parts = (filter, range).filter(part => part != none)
  if parts.len() == 0 {
    return none
  }
  box(
    fill: c-roundfx,
    inset: (x: 6pt, y: 4pt),
    radius: 4pt,
    grid(
      columns: parts.len(),
      column-gutter: 6pt,
      align: horizon,
      ..parts,
    ),
  )
}

#let unit-support-label(unit-support) = text(size: 7pt, fill: c-muted, {
  let count = unit-support.count
  str(count)
  if count > 1 { " Units" } else { " Unit" }
  if unit-support.supportType == "trait" {
    " – " + trait-phrase((unit-support.trait,))
  } else if unit-support.supportType == "unitType" {
    " – "
    smallcaps(unit-support.unitTypeId)
  }
})

#let command-text = command-phrase(card.command)
#let command-modifiers = card.command.modifiers
#let command-restrictions = restriction-view(card.command.restrictions)
#let round-modifiers = card.roundEffect.modifiers
#let round-restrictions = restriction-view(card.roundEffect.restrictions)

// Region tops as fractions of trim-height.
//   title     0    – 10%    umber
//   art       10%  – 45%    ivory
//   the rest  45%  – 100%   umber (command, round effect, unit support)
// Round-effect filters are pills on that umber, not a full-width band.
#let r-art = 0.10 * trim-height
#let r-cmd = 0.45 * trim-height

#place(top + left, box(width: 100%, height: bleed + r-art, fill: c-umber))
#place(
  top + left,
  dy: bleed + r-art,
  box(width: 100%, height: r-cmd - r-art, fill: c-ivory),
)
#place(
  top + left,
  dy: bleed + r-cmd,
  box(width: 100%, height: trim-height - r-cmd + bleed, fill: c-umber),
)

// Initiative fills the top-left corner, so its patch includes the top bleed.
// Commit boxes only touch the left edge.
#let oxblood-left(dy, height, width) = place(
  top + left,
  dy: dy,
  box(width: width, height: height, fill: c-oxblood),
)

#oxblood-left(0pt, bleed + 0.15 * trim-height, bleed + 0.20 * trim-width)
#oxblood-left(bleed + 0.175 * trim-height, 0.10 * trim-height, bleed)
#if second-commit-icon != none {
  oxblood-left(bleed + 0.30 * trim-height, 0.10 * trim-height, bleed)
}

#let title-band(name) = place(
  top + right,
  box(
    height: 10%,
    width: 80%,
    inset: 8pt,
    fill: c-umber,
    display-text(size: 12pt, name),
  ),
)

#let art-field(icon-name) = {
  place(
    top,
    dy: 10%,
    box(
      height: 35%,
      width: 100%,
      fill: c-ivory,
      inset: 12%,
      show-icon(icon-name, "black"),
    ),
  )
  // Washes the icon back to a watermark.
  place(
    top,
    dy: 10%,
    box(
      height: 35%,
      width: 100%,
      fill: c-ivory.transparentize(15%),
    ),
  )
}

#let initiative-badge(initiative) = place(
  top + left,
  box(
    height: 15%,
    width: 20%,
    inset: 10pt,
    fill: c-oxblood,
    align(center, display-text(size: 24pt, initiative)),
  ),
)

#let commit-badge(icon-name, dy) = place(
  top + left,
  dy: dy,
  box(
    height: 10%,
    width: 15%,
    inset: 4pt,
    fill: c-oxblood,
    align(center, show-icon(icon-name, "white")),
  ),
)

#let command-band(phrase, modifiers, restrictions) = place(
  top,
  box(
    height: 42.5%,
    width: 100%,
    inset: 2pt,
    {
      place(
        top + center,
        align(
          horizon,
          box(height: 60%, {
            display-text(phrase, size: 11pt)
            command-with(modifiers)
            inline-modifiers(modifiers, 9pt, 18pt, c-light, "white")
          }),
        ),
      )
      place(center + bottom, dy: -2pt, restriction-box(restrictions))
    },
  ),
)

#let round-band(modifiers, restrictions) = place(
  bottom,
  dy: -15%,
  box(
    height: 42.5%,
    width: 100%,
    inset: 2pt,
    {
      place(
        top + center,
        align(
          horizon,
          box(height: 55%, width: 70%, {
            inline-modifiers(modifiers, 10pt, 16pt, c-bronze, "bronze")
            text(fill: c-bronze, " this round")
          }),
        ),
      )
      place(center + bottom, dy: -2pt, restriction-box(restrictions))
    },
  ),
)

#let support-band(label) = place(
  bottom,
  box(
    height: 15%,
    width: 100%,
    inset: 7pt,
    label,
  ),
)

#place(
  top + center,
  dy: bleed,
  box(
    width: trim-width,
    height: trim-height,
    {
      title-band(card.name)
      art-field(first-commit-icon)
      initiative-badge(str(card.initiative))
      commit-badge(first-commit-icon, 17.5%)
      if second-commit-icon != none {
        commit-badge(second-commit-icon, 30%)
      }
      place(
        bottom,
        box(height: 55%, width: 100%, {
          command-band(command-text, command-modifiers, command-restrictions)
          round-band(round-modifiers, round-restrictions)
          support-band(unit-support-label(card.unitSupport))
        }),
      )
    },
  ),
)
