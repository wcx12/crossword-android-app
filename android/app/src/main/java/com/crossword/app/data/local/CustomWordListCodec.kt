package com.crossword.app.data.local

import com.crossword.app.data.model.Language
import com.crossword.app.data.model.WordEntry
import com.crossword.app.data.model.WordListInfo

object CustomWordListCodec {
    fun encodeMetadata(infos: List<WordListInfo>): String {
        return infos.joinToString(separator = "\n") { info ->
            listOf(
                info.id,
                info.name,
                info.assetPath.orEmpty(),
                info.wordCount.toString(),
                info.isSystem.toString(),
                info.language.name
            ).joinToString(separator = "\t") { it.escapeField() }
        }
    }

    fun decodeMetadata(text: String): List<WordListInfo> {
        return text.lineSequence()
            .filter { it.isNotBlank() }
            .mapNotNull { line ->
                val fields = line.split('\t')
                if (fields.size != 6) return@mapNotNull null

                val id = fields[0].unescapeField()
                val name = fields[1].unescapeField()
                val assetPath = fields[2].unescapeField().ifEmpty { null }
                val wordCount = fields[3].unescapeField().toIntOrNull() ?: return@mapNotNull null
                val isSystem = fields[4].unescapeField().toBooleanStrictOrNull() ?: return@mapNotNull null
                val language = runCatching { Language.valueOf(fields[5].unescapeField()) }.getOrNull()
                    ?: return@mapNotNull null

                WordListInfo(
                    id = id,
                    name = name,
                    assetPath = assetPath,
                    wordCount = wordCount,
                    isSystem = isSystem,
                    language = language
                )
            }
            .toList()
    }

    fun encodeEntries(entries: List<WordEntry>): String {
        return entries.joinToString(separator = "\n") { entry ->
            val clue = entry.clue.toSingleLine()
            if (clue.isBlank()) entry.word else "${entry.word} $clue"
        }
    }

    private fun String.toSingleLine(): String {
        return replace(Regex("[\\r\\n]+"), " ").trim()
    }

    private fun String.escapeField(): String {
        return replace("\\", "\\\\")
            .replace("\t", "\\t")
            .replace("\r", "\\r")
            .replace("\n", "\\n")
    }

    private fun String.unescapeField(): String {
        val result = StringBuilder(length)
        var escaping = false

        for (char in this) {
            if (escaping) {
                result.append(
                    when (char) {
                        't' -> '\t'
                        'r' -> '\r'
                        'n' -> '\n'
                        '\\' -> '\\'
                        else -> char
                    }
                )
                escaping = false
            } else if (char == '\\') {
                escaping = true
            } else {
                result.append(char)
            }
        }

        if (escaping) result.append('\\')
        return result.toString()
    }
}
