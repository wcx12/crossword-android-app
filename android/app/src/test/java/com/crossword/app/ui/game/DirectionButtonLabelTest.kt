package com.crossword.app.ui.game

import org.junit.Assert.assertEquals
import org.junit.Test

class DirectionButtonLabelTest {
    @Test
    fun keepsSelectedDirectionTextStableForEInkRefreshes() {
        assertEquals("横", DirectionButtonLabel.text("横", isSelected = true))
    }

    @Test
    fun keepsUnselectedDirectionPlain() {
        assertEquals("竖", DirectionButtonLabel.text("竖", isSelected = false))
    }
}
