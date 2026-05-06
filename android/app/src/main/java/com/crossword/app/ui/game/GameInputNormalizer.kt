package com.crossword.app.ui.game

import com.crossword.app.domain.model.Crossword

object GameInputNormalizer {
    fun normalizeInput(char: Char): Char {
        return if (char.isHan()) char else char.uppercaseChar()
    }

    fun candidateChars(crossword: Crossword?): List<Char> {
        if (crossword == null) return emptyList()

        return crossword.placements
            .asSequence()
            .flatMap { it.word.asSequence() }
            .filter { it.isHan() }
            .distinct()
            .toList()
    }

    fun inputModeFor(candidates: List<Char>): InputMode {
        return if (candidates.isEmpty()) InputMode.LETTERS else InputMode.CANDIDATE_CHARS
    }

    private fun Char.isHan(): Boolean {
        return this in '\u4e00'..'\u9fff'
    }
}
