package com.crossword.app.ui.game

class GameGenerationRequests {
    private val lock = Any()
    private var latest = 0

    fun next(): Int {
        return synchronized(lock) {
            latest += 1
            latest
        }
    }

    fun isCurrent(requestId: Int): Boolean {
        return synchronized(lock) {
            latest == requestId
        }
    }

    fun runIfCurrent(requestId: Int, block: () -> Unit): Boolean {
        return synchronized(lock) {
            if (latest != requestId) return@synchronized false

            block()
            true
        }
    }
}
