package com.crossword.app.ui.game

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class GameDestinationTest {
    @Test
    fun destinationsExposeTitlesAndConfigurationFlag() {
        assertEquals("填字游戏", GameDestination.Game.title)
        assertEquals("配置", GameDestination.Settings.title)
        assertFalse(GameDestination.Game.isConfiguration)
        assertTrue(GameDestination.Settings.isConfiguration)
    }
}
