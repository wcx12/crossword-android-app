package com.crossword.app.ui.game

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.crossword.app.data.local.WordFileParser
import com.crossword.app.data.model.WordEntry

private const val MinGridSize = 5
private const val MaxGridSize = 25

@Composable
fun GameSettingsScreen(
    state: GameState,
    draft: GameSettingsDraft,
    onDraftChange: (GameSettingsDraft) -> Unit,
    onImportWordList: (String, List<WordEntry>) -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(
                text = "词库与棋盘",
                style = MaterialTheme.typography.titleMedium
            )
            Text(
                text = "选择题库、调整行列，或导入自己的词条。点击完成后会生成新棋盘。",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        GameSetupPanel(
            state = state,
            draft = draft,
            onDraftChange = onDraftChange,
            onImportWordList = onImportWordList
        )
    }
}

@Composable
fun GameSetupPanel(
    state: GameState,
    draft: GameSettingsDraft,
    onDraftChange: (GameSettingsDraft) -> Unit,
    onImportWordList: (String, List<WordEntry>) -> Unit,
    modifier: Modifier = Modifier
) {
    var showImportDialog by remember { mutableStateOf(false) }

    val selectedList = remember(state.wordLists, draft.wordListId) {
        state.wordLists.firstOrNull { it.id == draft.wordListId }
    }
    val currentWordListName = selectedList?.name.orEmpty().ifBlank { "未选择词库" }

    BoxWithConstraints(modifier = modifier.fillMaxWidth()) {
        val horizontal = maxWidth >= 520.dp
        val contentModifier = Modifier.fillMaxWidth()

        if (horizontal) {
            Row(
                modifier = contentModifier,
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                WordListSelector(
                    label = currentWordListName,
                    state = state,
                    selectedWordListId = draft.wordListId,
                    onSelectWordList = { onDraftChange(draft.withWordList(it)) },
                    modifier = Modifier.weight(1f)
                )
                GridSizeControls(
                    rows = draft.rows,
                    cols = draft.cols,
                    onGridSizeChange = { rows, cols ->
                        onDraftChange(draft.withGridSize(rows, cols))
                    }
                )
                ImportWordListButton(onClick = { showImportDialog = true })
            }
        } else {
            Column(
                modifier = contentModifier,
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                WordListSelector(
                    label = currentWordListName,
                    state = state,
                    selectedWordListId = draft.wordListId,
                    onSelectWordList = { onDraftChange(draft.withWordList(it)) },
                    modifier = Modifier.fillMaxWidth()
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    GridSizeControls(
                        rows = draft.rows,
                        cols = draft.cols,
                        onGridSizeChange = { rows, cols ->
                            onDraftChange(draft.withGridSize(rows, cols))
                        }
                    )
                    ImportWordListButton(onClick = { showImportDialog = true })
                }
            }
        }
    }

    if (showImportDialog) {
        NamedWordImportDialog(
            onDismiss = { showImportDialog = false },
            onImport = onImportWordList
        )
    }
}

@Composable
private fun WordListSelector(
    label: String,
    state: GameState,
    selectedWordListId: String,
    onSelectWordList: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var expanded by remember { mutableStateOf(false) }

    Box(modifier = modifier) {
        OutlinedButton(
            onClick = { expanded = true },
            modifier = Modifier
                .fillMaxWidth()
                .height(40.dp),
            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 0.dp)
        ) {
            Text(
                text = label,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                style = MaterialTheme.typography.labelLarge
            )
        }

        DropdownMenu(
            expanded = expanded,
            onDismissRequest = { expanded = false },
            modifier = Modifier.widthIn(min = 240.dp, max = 360.dp)
        ) {
            state.wordLists.forEach { wordList ->
                DropdownMenuItem(
                    text = {
                        Column {
                            Text(
                                text = if (wordList.id == selectedWordListId) "${wordList.name} ✓" else wordList.name,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                            Text(
                                text = "${if (wordList.isSystem) "系统" else "自定义"} · ${wordList.wordCount} 词",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                maxLines = 1
                            )
                        }
                    },
                    onClick = {
                        expanded = false
                        onSelectWordList(wordList.id)
                    }
                )
            }
        }
    }
}

@Composable
private fun GridSizeControls(
    rows: Int,
    cols: Int,
    onGridSizeChange: (Int, Int) -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        GridAxisStepper(
            label = "行",
            value = rows,
            onValueChange = { onGridSizeChange(it, cols) }
        )
        Spacer(modifier = Modifier.width(2.dp))
        GridAxisStepper(
            label = "列",
            value = cols,
            onValueChange = { onGridSizeChange(rows, it) }
        )
    }
}

@Composable
private fun GridAxisStepper(
    label: String,
    value: Int,
    onValueChange: (Int) -> Unit
) {
    Row(
        horizontalArrangement = Arrangement.spacedBy(2.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = "$label $value",
            style = MaterialTheme.typography.labelMedium,
            maxLines = 1
        )
        CompactStepButton(
            text = "-",
            enabled = value > MinGridSize,
            onClick = { onValueChange((value - 1).coerceAtLeast(MinGridSize)) }
        )
        CompactStepButton(
            text = "+",
            enabled = value < MaxGridSize,
            onClick = { onValueChange((value + 1).coerceAtMost(MaxGridSize)) }
        )
    }
}

@Composable
private fun CompactStepButton(
    text: String,
    enabled: Boolean,
    onClick: () -> Unit
) {
    OutlinedButton(
        onClick = onClick,
        enabled = enabled,
        modifier = Modifier.size(width = 30.dp, height = 32.dp),
        contentPadding = PaddingValues(0.dp)
    ) {
        Text(text = text, style = MaterialTheme.typography.labelLarge)
    }
}

@Composable
private fun ImportWordListButton(onClick: () -> Unit) {
    OutlinedButton(
        onClick = onClick,
        modifier = Modifier.height(40.dp),
        contentPadding = ButtonDefaults.ButtonWithIconContentPadding
    ) {
        Text("导入词库", maxLines = 1)
    }
}

@Composable
private fun NamedWordImportDialog(
    onDismiss: () -> Unit,
    onImport: (String, List<WordEntry>) -> Unit
) {
    var listName by remember { mutableStateOf("") }
    var textInput by remember { mutableStateOf("") }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("导入词库") },
        text = {
            Column(modifier = Modifier.fillMaxWidth()) {
                OutlinedTextField(
                    value = listName,
                    onValueChange = {
                        listName = it
                        errorMessage = null
                    },
                    label = { Text("词库名") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = textInput,
                    onValueChange = {
                        textInput = it
                        errorMessage = null
                    },
                    label = { Text("词条") },
                    placeholder = { Text("APPLE A fruit\nBANANA Yellow fruit") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(min = 160.dp, max = 220.dp),
                    minLines = 6,
                    maxLines = 10
                )

                Text(
                    text = "每行一个词条，可用空格分隔单词和线索。",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(top = 8.dp)
                )

                errorMessage?.let {
                    Text(
                        text = it,
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.bodySmall,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }
            }
        },
        confirmButton = {
            TextButton(
                onClick = {
                    val trimmedName = listName.trim()
                    val entries = WordFileParser.parse(textInput)

                    when {
                        trimmedName.isBlank() -> errorMessage = "请输入词库名"
                        entries.isEmpty() -> errorMessage = "未能解析到有效词条"
                        else -> {
                            onImport(trimmedName, entries)
                            onDismiss()
                        }
                    }
                },
                enabled = listName.isNotBlank() && textInput.isNotBlank()
            ) {
                Text("导入")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("取消")
            }
        }
    )
}
