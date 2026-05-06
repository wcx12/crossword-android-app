package com.crossword.app.data.local

import org.junit.Assert.assertEquals
import org.junit.Test

class WordFileParserTest {
    @Test
    fun parseKeepsEnglishUppercaseAndChineseOriginalCharacters() {
        val entries = WordFileParser.parse(
            listOf(
                "python A programming language",
                "画蛇添足 比喻多此一举，反而坏事。",
                "",
                "bad-word rejected"
            )
        )

        assertEquals(listOf("PYTHON", "画蛇添足"), entries.map { it.word })
        assertEquals(listOf(6, 4), entries.map { it.length })
    }

    @Test
    fun validateReportsWhetherEveryNonBlankLineWasParsed() {
        val result = WordFileParser.validate(
            listOf(
                "APPLE A fruit",
                "HELLO-WORLD Invalid"
            )
        )

        assertEquals(false, result.first)
        assertEquals(listOf("APPLE"), result.second.map { it.word })
    }

    @Test
    fun parsesChineseIdiomLinesFromSystemAssetFormat() {
        val entries = WordFileParser.parse(
            listOf(
                "画蛇添足 比喻多此一举，反而坏事。",
                "杯弓蛇影 比喻疑神疑鬼。"
            )
        )

        assertEquals(listOf("画蛇添足", "杯弓蛇影"), entries.map { it.word })
    }
}
