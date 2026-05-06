package com.crossword.app.ui.game

import com.crossword.app.domain.model.Crossword
import com.crossword.app.domain.model.WordPlacement

object GameDeletionNavigator {
    fun findTarget(
        crossword: Crossword,
        selectedCell: Pair<Int, Int>,
        currentWord: WordPlacement?
    ): Pair<Int, Int>? {
        val selected = crossword.cellAt(selectedCell) ?: return null
        if (selected.isBlocked) return null
        if (selected.char != null) return selectedCell

        val wordCells = currentWord?.getCells().orEmpty()
        val selectedIndex = wordCells.indexOf(selectedCell)
        if (selectedIndex <= 0) return null

        return wordCells
            .take(selectedIndex)
            .asReversed()
            .firstOrNull { cell ->
                crossword.cellAt(cell)?.char != null
            }
    }

    private fun Crossword.cellAt(cell: Pair<Int, Int>) =
        grid.getOrNull(cell.first)?.getOrNull(cell.second)
}
