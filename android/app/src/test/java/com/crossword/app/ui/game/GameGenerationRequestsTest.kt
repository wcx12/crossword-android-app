package com.crossword.app.ui.game

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class GameGenerationRequestsTest {
    @Test
    fun onlyLatestRequestIsCurrent() {
        val requests = GameGenerationRequests()

        val first = requests.next()
        val second = requests.next()

        assertFalse(requests.isCurrent(first))
        assertTrue(requests.isCurrent(second))
    }

    @Test
    fun staleRequestCannotRunGuardedBlock() {
        val requests = GameGenerationRequests()
        var writes = 0

        val first = requests.next()
        val second = requests.next()

        assertFalse(requests.runIfCurrent(first) { writes += 1 })
        assertTrue(requests.runIfCurrent(second) { writes += 1 })
        assertEquals(1, writes)
    }
}
