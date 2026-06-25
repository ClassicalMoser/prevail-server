// Template for Command Cards

// Card size
#set page(height: 3.5in, width: 2.5in, margin: 0pt)

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
// First commit icon
#let first-commit-icon = card.modifiers.at(0).type
// Second commit icon (usually absent)
#let second-commit-icon = if card.modifiers.len() > 1 { card.modifiers.at(1).type } else { none }

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
#let c-bronze = color.oklch(66%, 0.09, 84deg) // icons, horsemen
#let c-roundfx = color.oklch(28%, 0.027, 45deg) // round effect band
#let c-stone = color.oklch(25%, 0.05, 355deg) // initiative/ commit boxes
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

#let display-range(number) = if number >= 0 {
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
// LAYOUT:

// Title Area
#place(
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
#place(
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
#place(
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
#place(
  top + left,
  dx:0%,
  dy:0%,
  box(
    height: 15%,
    width: 20%,
    inset: 10pt,
    fill: c-stone,
    [
      #align(center, display-text(
        size: 24pt,
        initiative
      ))
    ]
  )
)

// Commit Modifier 1
#place(
  top + left,
  dx:0%,
  dy:17.5%,
  box(
    height: 10%,
    width: 15%,
    inset: 4pt,
    fill: c-stone,
    [
      #align(center, show-icon(
        first-commit-icon,
        "bronze"
      ))
    ]
  )
)

// Conditional Commit Modifier 2
#place(
  top + left,
  dx:0%,
  dy:30%,
  {
    if second-commit-icon != none [
      #box(
        height: 10%,
        width: 15%,
        inset: 4pt,
        fill: c-stone,
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
#place(
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
            #place(
              right + bottom,
              box(
                height: 70%,
                inset: 4pt,
                display-range(command-range-restriction)
              )
            )
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
            #place(
              right + bottom,
              box(
                height: 100%,
                inset: 4pt,
                display-range(round-range-restriction)
              )
            )
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
              #support-number Units —
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




