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
            isInRelatedWord = false,
            highlightSelectedWord = false
        )

        assertEquals(CellBackgroundTone.Highlight, style.backgroundTone)
        assertFalse(style.usesDarkFill)
        assertTrue(style.hasSelectionBorder)
    }

    @Test
    fun selectedCellOutsideAWordStillUsesCellHighlight() {
        val style = CellVisualStyle.forCell(
            isBlocked = false,
            isSelected = true,
            isInCurrentWord = false,
            isInRelatedWord = false,
            highlightSelectedWord = false
        )

        assertEquals(CellBackgroundTone.Highlight, style.backgroundTone)
        assertFalse(style.usesDarkFill)
        assertTrue(style.hasSelectionBorder)
    }

    @Test
    fun currentWordCellKeepsEmptyBackgroundWhenWordHighlightIsDisabled() {
        val style = CellVisualStyle.forCell(
            isBlocked = false,
            isSelected = false,
            isInCurrentWord = true,
            isInRelatedWord = false,
            highlightSelectedWord = false
        )

        assertEquals(CellBackgroundTone.Empty, style.backgroundTone)
        assertFalse(style.usesDarkFill)
        assertFalse(style.hasSelectionBorder)
    }

    @Test
    fun currentWordCellUsesHighlightWhenWordHighlightIsEnabled() {
        val style = CellVisualStyle.forCell(
            isBlocked = false,
            isSelected = false,
            isInCurrentWord = true,
            isInRelatedWord = false,
            highlightSelectedWord = true
        )

        assertEquals(CellBackgroundTone.Highlight, style.backgroundTone)
        assertFalse(style.usesDarkFill)
        assertFalse(style.hasSelectionBorder)
    }
}
