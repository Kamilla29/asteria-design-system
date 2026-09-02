class_name DesignTokens
extends RefCounted

## Minimal Godot 4 adapter for the resolved game token JSON.
## DTCG source files remain canonical; conversion to engine-friendly values
## happens only at this platform boundary.

var _tokens: Dictionary = {}
var _source_path := ""

func load_from_file(path: String = "res://design-system/tokens.json") -> bool:
    _source_path = path
    var file := FileAccess.open(path, FileAccess.READ)
    if file == null:
        push_error("Design token file not found: %s" % path)
        return false

    var parsed = JSON.parse_string(file.get_as_text())
    if typeof(parsed) != TYPE_DICTIONARY:
        push_error("Design token JSON is invalid: %s" % path)
        return false

    _tokens = parsed
    return true

func is_loaded() -> bool:
    return not _tokens.is_empty()

func get_token(path: String, fallback = null):
    var current: Variant = _tokens
    for part in path.split("."):
        if typeof(current) != TYPE_DICTIONARY or not current.has(part):
            return fallback
        current = current[part]
    return _to_engine_value(current)

func describe(path: String) -> String:
    var value = get_token(path, null)
    if value == null:
        return "%s = <missing>" % path
    if value is Color:
        return "%s = #%s" % [path, value.to_html(false)]
    return "%s = %s" % [path, str(value)]

func source_path() -> String:
    return _source_path

func _to_engine_value(value):
    if typeof(value) == TYPE_DICTIONARY:
        if value.has("hex"):
            return Color.from_string(str(value["hex"]), Color.WHITE)
        if value.has("value") and value.has("unit"):
            var number := float(value["value"])
            if value["unit"] == "ms":
                return number / 1000.0
            return number
    return value
