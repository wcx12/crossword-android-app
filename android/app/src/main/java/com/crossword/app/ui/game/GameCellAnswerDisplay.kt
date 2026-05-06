package com.crossword.app.ui.game

import com.crossword.app.domain.model.Cell

object GameCellAnswerDisplay {
    fun displayChar(
        cell: Cell,
        showAnswer: Boolean,
        showCellInput: Boolean
    ): Char? {
        if (cell.isBlocked) return null
        if (showAnswer) return cell.solutionChar
        if (showCellInput) return cell.char
        return null
    }
}
