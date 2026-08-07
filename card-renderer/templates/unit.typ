
// Template for Unit Cards

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

// All individual items horizontally and vertically centered
#set align(horizon + center)
#set image(fit: "contain")

-------------------------------------------------------
// Get the data from json

#let unit = json("../unit-card-data.json").unitType

// Saving the main data elements to easy-access variables.

// The name of the unit
#let name = unit.name
// The unit's traits (lowercase ids)
#let traits = unit.traits
// The seven combat stats
#let stats = unit.stats
#let morale = unit.morale

-------------------------------------------------------

// Load the svg icons
#let show-icon(icon-name, color) = align(
  center + horizon,
  image(
    ("../icons/" + color + "/" + icon-name + "-" + color + ".svg")
  ),
)

// Set up our color palette (shared with the command cards)
#let c-umber = color.oklch(17%, 0.04, 92deg) // header / trait band
#let c-vellum = color.oklch(81%, 0.03, 92deg) // illustration field
#let c-ivory = color.oklch(93%, 0.027, 89deg) // primary text on dark
#let c-bronze = color.oklch(66.37%, 0.0711, 84.05deg) // icons and stats
#let c-traits = color.oklch(28%, 0.027, 45deg) // trait band

// Stat-category fills: aged and deep, in the same dark / low-chroma
// register as the command card so the four hues stay quiet.
#let c-attack = color.oklch(25%, 0.055, 25deg) // offense  (oxblood)
#let c-mobility = color.oklch(26%, 0.045, 150deg) // movement (deep green)
#let c-defense = color.oklch(25%, 0.045, 255deg) // defense  (slate-blue)
#let c-morale = color.oklch(25%, 0.05, 330deg) // morale   (dark plum)

// Set font default
#set text(font: "TeX Gyre Pagella", size: 8pt, fill: c-ivory)

// Create display font function
#let display-text(content, size: 12pt) = text(
  font: "Cinzel",
  size: size,
  fill: c-ivory,
  content,
)

// Create display font function
#let stat-text(content, size: 12pt) = text(
  font: "TeX Gyre Pagella",
  size: size,
  fill: c-bronze,
  content,
)

#let capitalize(word) = upper(word.at(0)) + word.slice(1)

-------------------------------------------------------
// Derivation of display text

// Shrink long names so they keep fitting on one line in the title band.
#let name-size = calc.min(13, 160 / name.len()) * 1pt

// Join traits into a friendly, comma-separated string.
#let trait-text = {
  traits.map(capitalize).join(", ")
}

-------------------------------------------------------
// Display Components

// An icon centered in its cell (the square spacer keeps every glyph the
// same visual weight regardless of its own aspect ratio).
#let icon-cell(icon-name, color, inset) = layout(
  size => {
    let side = calc.min(size.width, size.height)
    align(
      center + horizon,
      square(
        size: side,
      inset: inset,
        stroke: none,
        show-icon(icon-name, color),
      ),
    )
  }
)

// The central artwork for the unit card
#let unit-image = if json("../details.json").unitImage {
  image("../unit-image.png")
} else {
  place(
      top,
      box(
        width: 100%,
        height: 100%,
        inset: 0pt,
        fill: c-vellum,
        // Placeholder crest until static unit artwork exists
        icon-cell("commander", "black", 0pt),
      ),
    )
    // Lighten the art to a watermark
    place(
      top, box(
        width: 100%,
        height: 100%,
        fill: c-vellum.transparentize(30%)
        )
      )
    }
  )
}

#let unit-art = layout(
  size => {
    let side = calc.min(size.width, size.height)
    align(
      center + horizon,
      square(
        size: side,
        inset: 0pt,
        stroke: none,
        unit-image
      ),
    )
  }
)

// A stat shown as an icon beside its value.
#let inline-stat(
  icon-name,
  value,
  size: 16pt
) = grid(
    columns: (1fr, 1fr),
    inset: 5%,
    align: center + horizon,
    icon-cell(icon-name, "bronze", 1pt),
    stat-text(size: size, str(value)),
  )
)


// A stat shown as an icon above its value.
#let stacked-stat(icon-name, value) = grid(
  rows: (1fr, 1fr),
  inset: 0pt,
  align: center + horizon,
  icon-cell(icon-name, "bronze", 10%),
  stat-text(size: 14pt, str(value)),
)

-------------------------------------------------------
// BLEED UNDERLAY:
// Three stacked bands across the full page so the trimmed-off margin
// carries the right color. Entirely hidden under the card when bleed = 0.

#place(top + left, box(width: 100%, height: bleed + trim-height / 2, fill: c-vellum))
#place(
  top + left,
  dy: bleed + trim-height / 2,
  box(width: 100%, height: trim-height / 14, fill: c-traits),
)
#place(
  top + left,
  dy: bleed + trim-height / 2 + trim-height / 14,
  box(width: 100%, height: bleed + trim-height * 3 / 7, fill: c-umber),
)

-------------------------------------------------------
// CARD:
// Composed inside a trim-sized box so every placement below is // a clean percentage of the card.
//
//   illustration field  top      height 50%
//   trait band          dy 50%   height 1/14
//   stat frame          bottom   height 3/7
//   title band          dy 1/28  height 1/14
//   (floats over the field)

// The trim layout (within the bleed)
#place(
  top + center,
  dy: bleed,
  box(
    width: trim-width,
    height: trim-height,
    {
      // Illustration field with watermark art
      place(
        top,
        dy: 10%,
        box(
          width: 100%,
          height: 40%,
          inset: 15%,
          fill: c-vellum,
          // Placeholder crest until static unit artwork exists
          unit-art
        ),
      )
    
      // Trait band
      place(
        top,
        dy: 50%,
        box(
          width: 100%,
          height: 100% / 12,
          inset: 4pt,
          fill: c-traits,
          place(
            center + horizon,
            dy: -1pt,
            text(
              fill: c-vellum,
              trait-text
            )
          ),
        ),
      )
    
      // Stat frame
      place(
        bottom,
        box(
          width: 100%,
          height: 100% * 3 / 7,
          fill: c-umber, {
            // Left column: attack over defense
            place(
              left + horizon,
              dx: 3.5%,
              box(
                width: 61%,
                height: 90%,
                {
                // Attack panel (offense): attack + range
                place(
                  top,
                  box(
                    width: 100%,
                    height: 45%,
                    fill: c-attack,
                    inset: 0pt,
                    align(
                      horizon,
                      grid(
                        columns: (35%, 35%, 30%),

                        align: center + horizon,
                        icon-cell("attack", "bronze", 5pt),
                        stat-text(
                          size: 28pt,
                          str(stats.attack)
                        ),
                        box(
                          width: 100%,
                          height: 100%,
                          {
                            place(
                              dx: 5pt,
                              dy: 6pt,
                              box(
                                height: 40%,
                                show-icon(
                                  "range",
                                  "bronze"
                                )
                              )
                            )
                            place(
                              right + bottom,
                              dx: -5pt,
                              dy: -6pt,
                              stat-text(
                                size: 14pt,
                                str(stats.range)
                              )
                            )
                          }
                        ),
                      ),
                    )
                  ),
                )
                // Defense panel: defense crest classifies retreat / reverse / rout
                place(
                  bottom,
                  box(
                    width: 100%,
                    height: 50%,
                    fill: c-defense,
                    inset: 0pt, align(
                      horizon,
                      grid(
                        columns: (35%, 65%),
                        align: center + horizon,
                        column-gutter: 0pt,
                        icon-cell("defense", "bronze", 5pt),
                        box(
                          inset: (x: 0pt, y: 5pt ),
                          grid(
                            columns: (1fr, 1fr, 1fr),
                            stacked-stat(
                              "retreat", stats.retreat
                            ),                            stacked-stat(
                              "reverse", stats.reverse
                            ),
                            stacked-stat("rout", stats.rout)
                          )  
                        )
                        
                      ),
                    )
                  ),
                )
              }
            )
          )
    
          // Right column: mobility over morale
          place(right + horizon, dx: -3.5%, box(width: 29%, height: 90%, {
            // Mobility panel (movement): speed + flexibility
            place(
              top,
              box(
                width: 100%,
                height: 57%,
                fill: c-mobility,
                inset: 5pt,
                box(
                  width: 100%,
                  height: 100%,
                  place(
                    horizon + center,
                    grid(
                      rows: (1fr, 1fr),
                      inline-stat(
                        "speed",
                        stats.speed,
                        size: 18pt
                      ),
                      inline-stat(
                        "flexibility",
                        stats.flexibility,
                        size: 18pt
                      )
                    )
                  )
                )
              ),
            )
            // Morale panel: morale crest + value
            place(
              bottom,
              box(
                width: 100%,
                height: 38%,
                fill: c-morale,
                inset: 5pt,
                place(
                  horizon + center,
                  inline-stat(
                    "morale",
                    morale,
                    size: 20pt,
                  )
                )
              ),
            )
          }))
        }),
      )
    
      // Title band (floats over the illustration field)
      place(
        top + center,
        dy: 100% / 28,
        box(
          width: 70%,
          height: 100% / 14,
          inset: 4pt,
          fill: c-umber,
          align(
            center + horizon,
            display-text(
              name,
              size: name-size
            )
            ),
        ),
      )
    }
  )
)
