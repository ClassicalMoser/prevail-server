/**
 * Comment and code lines counted inside bodies.
 *
 * Only lines that sit inside a brace-delimited body are counted, which is what
 * the commentary standard is about: a header block above a declaration says
 * what the thing is, while the lines inside say why each step is there. Blank
 * lines are in neither count, so indentation style cannot move the number.
 */
export interface BodyDensity {
  /** Code lines inside a body. */
  code: number;
  /** Comment lines inside a body, member JSDoc included. */
  comments: number;
}
