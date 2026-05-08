package com.crossword.app.ui.game

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class CellVisualStyleTest {
    @Test
    fun selectedCellUsesBorderEmphasisWithoutDarkFill() {
        val style = CellVisualStyle.forCell(
            isBlocked = false,
            isSelected = true,
            isInCurrentWord = true,
            isInRelatedWord = false
        )

        assertEquals(CellBackgroundTone.Highlight, style.backgroundTone)
        assertFalse(style.usesDarkFill)
        assertTrue(style.hasSelectionBorder)
    }

    @Test
    fun selectedCellOutsideAWordKeepsEmptyBackground() {
        val style = CellVisualStyle.forCell(
            isBlocked = false,
            isSelected = true,
            isInCurrentWord = false,
            isInRelatedWord = false
        )

        assertEquals(CellBackgroundTone.Empty, style.backgroundTone)
        assertFalse(style.usesDarkFill)
        assertTrue(style.hasSelectionBorder)
    }
}
