// Template for Command Cards

// Card size
#let trim-width = 2.5in
#let trim-height = 3.5in

// Bleed (written by render-unit-card.ts -> details.json). When on, the
// page grows by an eighth-inch on every edge so trimming stays clean.
#let bleed = if json("../details.json").bleed { 0.125in } else { 0pt }

#set page(
  width: trim-width + 2 * bleed,
  height: trim-height + 2 * bleed,
  margin: 0pt,
)

// All individual items center-aligned
#set align(center)
#set image(fit: "contain")

-------------------------------------------------------
// Get the data from json

#let card = json("../command-card-data.json").card

// Saving the main data elements to easy-access variables.
// A bit verbose but saves a lot of lookups and centralizes

// The name of the card
#let name = card.name
// Initiative (string from number)
#let initiative = str(card.initiative)
// First commit icon (card-level modifiers are stat names, e.g. "attack")
#let first-commit-icon = card.modifiers.at(0)
// Second commit icon (usually absent)
#let second-commit-icon = if card.modifiers.len() > 1 {
  card.modifiers.at(1)
} else {
  none
}

// Command Elements
#let command-type = card.command.type
#let command-number = card.command.number
#let command-size = card.command.size

#let command-modifiers = card.command.modifiers

#let command-unit-restrictions = card.command.restrictions.unitRestrictions
#let command-trait-restrictions = card.command.restrictions.traitRestrictions
#let command-range-restriction = card.command.restrictions.inspirationRangeRestriction

// Round Effect Elements
#let round-effect-modifiers = card.roundEffect.modifiers

#let round-unit-restrictions = card.roundEffect.restrictions.unitRestrictions
#let round-trait-restrictions = card.roundEffect.restrictions.traitRestrictions
#let round-range-restriction = card.roundEffect.restrictions.inspirationRangeRestriction

// Supported Units
#let supported-units = card.unitSupport
#let support-number = supported-units.count
#let support-type = supported-units.supportType
#let supported-trait = if ("trait" in supported-units) { supported-units.trait } else { none }
#let supported-unit-type = if ("unitTypeId" in supported-units) { supported-units.unitTypeId } else { none }



-------------------------------------------------------

// Load the svg icons
#let show-icon(icon-name, color) = image(
  ("../icons/" + color + "/" + icon-name + "-" + color + ".svg")
)

// Set up our color palette
#let c-umber = color.oklch(17%, 0.04, 92deg) // header/command band
#let c-vellum = color.oklch(81%, 0.03, 92deg) // illustration field
#let c-bronze = color.oklch(66.37%, 0.0711, 84.05deg) // icons, horsemen
#let c-roundfx = color.oklch(28%, 0.027, 45deg) // round effect band
#let c-oxblood = color.oklch(25%, 0.055, 25deg) // initiative/ commit boxes
#let c-ivory = color.oklch(93%, 0.027, 89deg) //primary text on dark
#let c-muted = color.oklch(65%, 0.032, 81deg) // secondary text (labels, footer)

// Set font default
#set text(font: "TeX Gyre Pagella", size: 9pt)

// Create display font function
#let display-text(content, size: 12pt) = text(
  font: "Cinzel",
  size: size,
  fill: c-ivory,
  content
)

#let capitalize(word) = upper(word.at(0)) + word.slice(1)

-------------------------------------------------------
// Derivation of display text

// Convert size to singular if command number is 1
#let command-singular = command-number == 1
#let command-size-formatted = if command-singular {
  if command-size == "lines" {
    "Line"
  } else {
    "Unit"
  }
} else {
  if command-size == "lines" {
    "Lines"
  } else {
    "Units"
  }
}

// Show user-friendly command type
#let command-type-formatted = if command-type == "rangedAttack" {
  "RANGED ATTACK"
} else {
  "MOVE"
}

// Format command text
#let command-text = command-type-formatted + " with " + str(command-number) + " " + command-size-formatted

// Derivation of Unit and Trait Restriction Arrays

// Put Unit Restrictions in all caps
#let format-unit-restriction(units) = units.map(smallcaps)

// Join trait restrictions into a string
#let string-trait-restrictions(traits) = if traits.len() == 0 { () } else { (traits.map(capitalize).join(", "),) }

#let combined-retrictions(units, traits) = format-unit-restriction(units) + (string-trait-restrictions(traits))

#let display-restriction-text(item) = text(
  fill: c-muted,
  size: 7pt,
  item
)

#let display-generic-restriction-text(item) = text(
  fill: c-muted,
  item
)

#let combined-command-restrictions = combined-retrictions(
  command-unit-restrictions, command-trait-restrictions
).map(display-restriction-text)

#let display-command-restrictions = if combined-command-restrictions.len() == 0 {
  (display-generic-restriction-text("ANY"),)
} else {
  combined-command-restrictions
}

#let combined-round-restrictions = combined-retrictions(
  round-unit-restrictions, round-trait-restrictions
).map(display-restriction-text)

#let display-round-restrictions = if combined-round-restrictions.len() == 0 {
  (display-generic-restriction-text("ALL"),)
} else {
  combined-round-restrictions
}

-------------------------------------------------------

// Display Components

#let vertical-box(content-array) = if content-array.len()== 0 {
  [] 
} else {
  box(
    height: 100%,
    width: 100%,
    stack(
      spacing: 0pt,
      ..content-array
      .map((item) =>
        align(horizon, box(
          height: 100% / content-array.len(),
          width: 100%,
          inset:0pt,
          item
        ))
      )
    )
  )
}

#let number-sign(number) = if number < 0 {"– "} else {"+ "}

#let display-modifier(modifier) = box(
  height: 100%,
  width: 100%,
  align(horizon,
    grid(
      align: right,
      columns: (50%,50% ),
      inset: 3pt,
      align(
        right,
        text(
          fill: c-bronze,
          size: 8pt,
          number-sign(modifier.value)
          + str(calc.abs(modifier.value))
        )
      ),
      align(center,(image("../icons/bronze/" + modifier.type + "-bronze.svg")))
    )
  )
)

#let display-range(number) = if number != none {
  box(
    height: 100%,
    [
      #show-icon("commander", "bronze")
      #place(center + horizon, str(number))
    ]
  )
} else {
  []
}

-------------------------------------------------------
// BLEED UNDERLAY:
// Full-page-width bands continue each horizontal region's color out into
// the trimmed-off margin, plus left-edge patches so the oxblood initiative
// and commit boxes bleed correctly. Entirely hidden under the card when
// bleed = 0.
//
// Region boundaries as fractions of trim-height (top -> bottom):
//   title          0      – 10%      umber
//   art field      10%    – 45%      ivory
//   command box    45%    – 72.5%    umber
//   round effects  72.5%  – 91.75%   roundfx
//   unit support   91.75% – 100%     umber

#let r-art   = 0.10   * trim-height
#let r-cmd   = 0.45   * trim-height
#let r-round = 0.725  * trim-height
#let r-supp  = 0.9175 * trim-height

// Full-width bands (match each region's right edge). The first reaches up
// into the top bleed; the last reaches down into the bottom bleed.
#place(top + left, box(width: 100%, height: bleed + r-art, fill: c-umber))
#place(top + left, dy: bleed + r-art,
  box(width: 100%, height: r-cmd - r-art, fill: c-ivory))
#place(top + left, dy: bleed + r-cmd,
  box(width: 100%, height: r-round - r-cmd, fill: c-umber))
#place(top + left, dy: bleed + r-round,
  box(width: 100%, height: r-supp - r-round, fill: c-roundfx))
#place(top + left, dy: bleed + r-supp,
  box(width: 100%, height: bleed + (trim-height - r-supp), fill: c-umber))

// Left-edge oxblood corrections. Initiative sits in the top-left corner, so
// its patch fills the top bleed above it as well; the commit boxes touch
// only the left edge, so theirs fill the left bleed strip.
#let oxblood-left(dy, h, w) = place(
  top + left, dy: dy, box(width: w, height: h, fill: c-oxblood),
)

// Initiative: card-local 0–15% tall, 20% wide.
#oxblood-left(0pt, bleed + 0.15 * trim-height, bleed + 0.20 * trim-width)
// Commit modifier 1: card-local 17.5–27.5%.
#oxblood-left(bleed + 0.175 * trim-height, 0.10 * trim-height, bleed)
// Commit modifier 2: only when present (card-local 30–40%).
#if second-commit-icon != none {
  oxblood-left(bleed + 0.30 * trim-height, 0.10 * trim-height, bleed)
}

-------------------------------------------------------
// The trim layout (within the bleed)
#place(
  top + center,
  dy: bleed,
  box(
    width: trim-width,
    height: trim-height,
    {
      // Title Area
      place(
        top + right,
        dx:0%,
        dy:0%,
        box(
          height: 10%,
          width: 80%,
          inset: 8pt,
          fill: c-umber,
          [
            // We'll need some conditional logic
            // to make it fit when name is long
            #display-text(size: 12pt, name)
          ]
        )
      )
      
      // Art Section
      place(
        top,
        dx: 0%,
        dy: 10%,
        box(
          height: 35%,
          width: 100%,
          fill: c-ivory,
          inset: 12%,
          show-icon(first-commit-icon, "black")
        )  
      )
      
      // Second Rectangle to lighten to a water mark.
      place(
        top,
        dx: 0%,
        dy: 10%,
        box(
          height: 35%,
          width: 100%,
          fill: c-ivory.transparentize(15%),
        )
      )
      
      
      
      // Initiative Area
      place(
        top + left,
        dx:0%,
        dy:0%,
        box(
          height: 15%,
          width: 20%,
          inset: 10pt,
          fill: c-oxblood,
          [
            #align(center, display-text(
              size: 24pt,
              initiative
            ))
          ]
        )
      )
      
      // Commit Modifier 1
      place(
        top + left,
        dx:0%,
        dy:17.5%,
        box(
          height: 10%,
          width: 15%,
          inset: 4pt,
          fill: c-oxblood,
          [
            #align(center, show-icon(
              first-commit-icon,
              "bronze"
            ))
          ]
        )
      )
      
      // Conditional Commit Modifier 2
      place(
        top + left,
        dx:0%,
        dy:30%,
        {
          if second-commit-icon != none [
            #box(
              height: 10%,
              width: 15%,
              inset: 4pt,
              fill: c-oxblood,
              [
                #align(center, show-icon(
                  second-commit-icon,
                  "bronze"
                ))
              ]
            )
          ]
        }
      )
      
      // Main Box
      place(
        bottom,
        dx:0%,
        dy:0%,
        box(
          height: 55%,
          width: 100%,
          [
            // Command Box
            #place(
              top,
              dx:0%,
              dy:0%,
              box(
                height: 50%,
                width: 100%,
                inset: 4pt,
                fill: c-umber,
                [
                  #place(
                    top + center,
                    box(
                      inset: 4pt,
                      text(
                        size: 9pt,
                        fill: c-ivory,
                        command-text
                      )
                    )
                  )
                  #place(
                    left + bottom,
                    box(
                      height: 70%,
                      width: 27.5%,
                      vertical-box(
                        (command-modifiers.map(display-modifier))
                      )
                    )
                  )
                  #place(
                    center + bottom,
                    box(
                      height: 70%,
                      width: 45%,
                      vertical-box(display-command-restrictions)
                    )
                  )
                  #if command-range-restriction > -1 {
                    place(
                      right + bottom,
                      box(
                        height: 70%,
                        inset: 4pt,
                        display-range(command-range-restriction)
                      )
                    )
                  }
                ]
              )
            )
            
            // Round Effects Box
            #place(
              bottom,
              dx:0%,
              dy:-15%,
              box(
                height: 35%,
                width: 100%,
                inset: 4pt,
                fill: c-roundfx,
                [
                  #place(
                    left + bottom,
                    box(
                      height: 100%,
                      width: 27.5%,
                      vertical-box(
                        (round-effect-modifiers.map(display-modifier))
                      )
                    )
                  )
                  #place(
                    center + bottom,
                    box(
                      height: 100%,
                      width: 45%,
                      vertical-box(display-round-restrictions)
                    )
                  )
                  #if round-range-restriction > -1 {
                    place(
                      right + bottom,
                      box(
                        height: 100%,
                        inset: 4pt,
                        display-range(round-range-restriction)
                      )
                    )
                  }
                ]
              )
            )
            
            // Unit Support Box
            #place(
              bottom,
              dx:0%,
              dy:0%,
              box(
                height: 15%,
                width: 100%,
                inset: 7pt,
                fill: c-umber,
                [
                  #text(size: 7pt, fill: c-muted, [
                    #support-number
                    #if support-number > 1{
                      "Units"
                    } else {
                      "Unit"
                    } —
                    #if (support-type == "generic") {
                      "ANY"
                    } else if (support-type == "trait") {
                      supported-trait        
                    } else if (support-type == "unitType") {
                      supported-unit-type
                    }
                  ])
                ]
              )
            )
          ]
        )
      )
    }
  )
)