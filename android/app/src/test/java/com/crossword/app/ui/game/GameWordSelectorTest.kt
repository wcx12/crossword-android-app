package com.crossword.app.ui.game

import com.crossword.app.domain.model.Cell
import com.crossword.app.domain.model.Clue
import com.crossword.app.domain.model.Crossword
import com.crossword.app.domain.model.Direction
import com.crossword.app.domain.model.WordPlacement
import org.junit.Assert.assertEquals
import org.junit.Test

class GameWordSelectorTest {
    @Test
    fun selectsHorizontalWordAtCrossingWhenDirectionIsHorizontal() {
        val crossword = crossingCrossword()

        val selected = GameWordSelector.selectWord(
            crossword = crossword,
            row = 0,
            col = 0,
            preferredDirection = Direction.HORIZONTAL
        )

        assertEquals("横词", selected?.word)
    }

    @Test
    fun selectsVerticalWordAtCrossingWhenDirectionIsVertical() {
        val crossword = crossingCrossword()

        val selected = GameWordSelector.selectWord(
            crossword = crossword,
            row = 0,
            col = 0,
            preferredDirection = Direction.VERTICAL
        )

        assertEquals("竖词", selected?.word)
    }

    @Test
    fun fallsBackToTheOnlyWordAtCellWhenPreferredDirectionIsUnavailable() {
        val crossword = crossingCrossword()

        val selected = GameWordSelector.selectWord(
            crossword = crossword,
            row = 1,
            col = 0,
            preferredDirection = Direction.HORIZONTAL
        )

        assertEquals(Direction.VERTICAL, selected?.direction)
    }

    private fun crossingCrossword(): Crossword {
        val horizontal = WordPlacement(
            id = 1,
            word = "横词",
            clue = "horizontal",
            row = 0,
            col = 0,
            direction = Direction.HORIZONTAL,
            number = 1,
            displayLabel = "1"
        )
        val vertical = WordPlacement(
            id = 2,
            word = "竖词",
            clue = "vertical",
            row = 0,
            col = 0,
            direction = Direction.VERTICAL,
            number = 1,
            displayLabel = "A"
        )
        val grid = listOf(
            listOf(
                Cell(row = 0, col = 0, solutionChar = 'A'),
                Cell(row = 0, col = 1, solutionChar = 'B')
            ),
            listOf(
                Cell(row = 1, col = 0, solutionChar = 'C'),
                Cell(row = 1, col = 1, isBlocked = true)
            )
        )

        return Crossword(
            rows = 2,
            cols = 2,
            grid = grid,
            placements = listOf(horizontal, vertical),
            clues = listOf(
                Clue(horizontal.number, horizontal.word, horizontal.clue, horizontal.direction),
                Clue(vertical.number, vertical.word, vertical.clue, vertical.direction)
            )
        )
    }
}
