package com.crossword.app.ui.game

import com.crossword.app.domain.model.Cell
import com.crossword.app.domain.model.Clue
import com.crossword.app.domain.model.Crossword
import com.crossword.app.domain.model.Direction
import com.crossword.app.domain.model.WordPlacement
import org.junit.Assert.assertEquals
import org.junit.Test

class GameInputNormalizerTest {
    @Test
    fun normalizeInputUppercasesLatinAndKeepsHanCharacters() {
        assertEquals('A', GameInputNormalizer.normalizeInput('a'))
        assertEquals('B', GameInputNormalizer.normalizeInput('B'))
        assertEquals('你', GameInputNormalizer.normalizeInput('你'))
    }

    @Test
    fun candidateCharsReturnDistinctSolutionCharactersInPlacementOrder() {
        val crossword = Crossword(
            rows = 2,
            cols = 2,
            grid = listOf(
                listOf(
                    Cell(row = 0, col = 0, solutionChar = '你'),
                    Cell(row = 0, col = 1, solutionChar = '好')
                ),
                listOf(
                    Cell(row = 1, col = 0, solutionChar = '你'),
                    Cell(row = 1, col = 1, isBlocked = true)
                )
            ),
            placements = listOf(
                WordPlacement(
                    id = 1,
                    word = "你好",
                    clue = "Greeting",
                    row = 0,
                    col = 0,
                    direction = Direction.HORIZONTAL,
                    number = 1,
                    displayLabel = "1"
                )
            ),
            clues = listOf(
                Clue(
                    number = 1,
                    word = "你好",
                    clue = "Greeting",
                    direction = Direction.HORIZONTAL
                )
            )
        )

        assertEquals(listOf('你', '好'), GameInputNormalizer.candidateChars(crossword))
    }
}
