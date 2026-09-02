extends RefCounted

var language: String = "en"
var dictionaries: Dictionary = {}

func load_locales() -> bool:
    for code in ["en", "cs"]:
        var path := "res://locales/%s.json" % code
        if not FileAccess.file_exists(path):
            push_error("Locale file not found: " + path)
            return false
        var file := FileAccess.open(path, FileAccess.READ)
        if file == null:
            push_error("Could not open locale file: " + path)
            return false
        var parsed = JSON.parse_string(file.get_as_text())
        if typeof(parsed) != TYPE_DICTIONARY or not parsed.has("strings"):
            push_error("Invalid locale file: " + path)
            return false
        dictionaries[code] = parsed["strings"]
    return true

func set_language(code: String) -> void:
    language = code if code in ["en", "cs"] else "en"

func t(source: String) -> String:
    if language == "en":
        return source
    var dictionary: Dictionary = dictionaries.get(language, {})
    return str(dictionary.get(source, source))
