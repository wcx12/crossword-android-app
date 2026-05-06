package com.crossword.app.ui.game

import com.crossword.app.domain.model.Cell
import com.crossword.app.domain.model.Clue
import com.crossword.app.domain.model.Crossword
import com.crossword.app.domain.model.Direction
import com.crossword.app.domain.model.WordPlacement
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class GameDeletionNavigatorTest {
    @Test
    fun deleteTargetsSelectedCellWhenItHasInput() {
        val crossword = crosswordWithChars('A', 'B', null)
        val word = horizontalWord()

        val target = GameDeletionNavigator.findTarget(
            crossword = crossword,
            selectedCell = Pair(0, 1),
            currentWord = word
        )

        assertEquals(Pair(0, 1), target)
    }

    @Test
    fun deleteTargetsPreviousFilledCellWhenSelectedCellIsEmpty() {
        val crossword = crosswordWithChars('A', 'B', null)
        val word = horizontalWord()

        val target = GameDeletionNavigator.findTarget(
            crossword = crossword,
            selectedCell = Pair(0, 2),
            currentWord = word
        )

        assertEquals(Pair(0, 1), target)
    }

    @Test
    fun deleteTargetsNearestPreviousFilledCellWhenImmediatePreviousIsEmpty() {
        val crossword = crosswordWithChars('A', null, null)
        val word = horizontalWord()

        val target = GameDeletionNavigator.findTarget(
            crossword = crossword,
            selectedCell = Pair(0, 2),
            currentWord = word
        )

        assertEquals(Pair(0, 0), target)
    }

    @Test
    fun deleteReturnsNullWhenSelectedAndPreviousCellsAreEmpty() {
        val crossword = crosswordWithChars(null, null, null)
        val word = horizontalWord()

        val target = GameDeletionNavigator.findTarget(
            crossword = crossword,
            selectedCell = Pair(0, 2),
            currentWord = word
        )

        assertNull(target)
    }

    private fun crosswordWithChars(vararg chars: Char?): Crossword {
        val grid = listOf(
            chars.mapIndexed { col, char ->
                Cell(row = 0, col = col, char = char, solutionChar = 'A', isBlocked = false)
            }
        )
        val word = horizontalWord()

        return Crossword(
            rows = 1,
            cols = chars.size,
            grid = grid,
            placements = listOf(word),
            clues = listOf(
                Clue(
                    number = word.number,
                    word = word.word,
                    clue = word.clue,
                    direction = word.direction
                )
            )
        )
    }

    private fun horizontalWord(): WordPlacement {
        return WordPlacement(
            id = 1,
            word = "ABC",
            clue = "letters",
            row = 0,
            col = 0,
            direction = Direction.HORIZONTAL,
            number = 1,
            displayLabel = "1"
        )
    }
}
