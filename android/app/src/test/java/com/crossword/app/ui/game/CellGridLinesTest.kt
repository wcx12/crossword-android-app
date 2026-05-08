package com.crossword.app.ui.game

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class CellGridLinesTest {
    @Test
    fun adjacentCellsDrawSharedEdgesOnlyOnce() {
        val edges = CellGridLines.forCell(
            row = 0,
            col = 0,
            rows = 2,
            cols = 2,
            isBlocked = { _, _ -> false }
        )

        assertTrue(edges.top)
        assertTrue(edges.left)
        assertFalse(edges.right)
        assertFalse(edges.bottom)
    }

    @Test
    fun exposedRightAndBottomEdgesAreDrawnWhenNeighborIsBlocked() {
        val edges = CellGridLines.forCell(
            row = 0,
            col = 0,
            rows = 2,
            cols = 2,
            isBlocked = { r, c -> r == 0 && c == 1 || r == 1 && c == 0 }
        )

        assertTrue(edges.right)
        assertTrue(edges.bottom)
    }

    @Test
    fun outerGridEdgesAreDrawnAtPuzzleBounds() {
        val edges = CellGridLines.forCell(
            row = 1,
            col = 1,
            rows = 2,
            cols = 2,
            isBlocked = { _, _ -> false }
        )

        assertTrue(edges.right)
        assertTrue(edges.bottom)
    }
}
