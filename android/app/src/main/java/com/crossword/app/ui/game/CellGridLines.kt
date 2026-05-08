package com.crossword.app.ui.game

data class CellGridLines(
    val top: Boolean,
    val left: Boolean,
    val right: Boolean,
    val bottom: Boolean
) {
    companion object {
        fun forCell(
            row: Int,
            col: Int,
            rows: Int,
            cols: Int,
            isBlocked: (Int, Int) -> Boolean
        ): CellGridLines {
            return CellGridLines(
                top = true,
                left = true,
                right = col == cols - 1 || isBlocked(row, col + 1),
                bottom = row == rows - 1 || isBlocked(row + 1, col)
            )
        }
    }
}
