package com.crossword.app.data.local

import com.crossword.app.data.model.Language
import com.crossword.app.data.model.WordEntry
import com.crossword.app.data.model.WordListInfo
import org.junit.Assert.assertEquals
import org.junit.Test

class CustomWordListCodecTest {
    @Test
    fun metadataRoundTripsTabSeparatedWordListInfo() {
        val infos = listOf(
            WordListInfo(
                id = "custom_123",
                name = "My\tList",
                assetPath = null,
                wordCount = 2,
                isSystem = false,
                language = Language.EN
            ),
            WordListInfo(
                id = "system",
                name = "System\nList",
                assetPath = "wordlists/system.txt",
                wordCount = 7,
                isSystem = true,
                language = Language.ZH
            )
        )

        val encoded = CustomWordListCodec.encodeMetadata(infos)

        assertEquals(infos, CustomWordListCodec.decodeMetadata(encoded))
    }

    @Test
    fun decodeMetadataIgnoresBlankAndMalformedLines() {
        val text = """
            custom_1	Custom		3	false	EN

            missing	fields
            custom_2	Other		4	false	ZH
        """.trimIndent()

        val infos = CustomWordListCodec.decodeMetadata(text)

        assertEquals(listOf("custom_1", "custom_2"), infos.map { it.id })
        assertEquals(listOf(Language.EN, Language.ZH), infos.map { it.language })
    }

    @Test
    fun encodeEntriesUsesWordFileParserCompatibleLines() {
        val entries = listOf(
            WordEntry("PYTHON", "A programming language"),
            WordEntry("JAVA", "")
        )

        val encoded = CustomWordListCodec.encodeEntries(entries)

        assertEquals("PYTHON A programming language\nJAVA", encoded)
        assertEquals(entries, WordFileParser.parse(encoded))
    }
}
