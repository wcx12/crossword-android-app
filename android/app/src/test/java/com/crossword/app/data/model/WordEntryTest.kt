package com.crossword.app.data.model

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class WordEntryTest {
    @Test
    fun parsesEnglishWordAndUppercasesIt() {
        val entry = WordEntry.fromLine("python A programming language")

        assertEquals("PYTHON", entry?.word)
        assertEquals("A programming language", entry?.clue)
        assertEquals(6, entry?.length)
    }

    @Test
    fun parsesChineseIdiomWithoutChangingCharacters() {
        val entry = WordEntry.fromLine("画蛇添足 比喻多此一举，反而坏事。")

        assertEquals("画蛇添足", entry?.word)
        assertEquals("比喻多此一举，反而坏事。", entry?.clue)
        assertEquals(4, entry?.length)
    }

    @Test
    fun rejectsWordsWithDigitsOrPunctuation() {
        assertNull(WordEntry.fromLine("PYTHON3 Invalid"))
        assertNull(WordEntry.fromLine("HELLO-WORLD Invalid"))
    }
}
