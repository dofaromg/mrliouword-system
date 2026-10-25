#ifndef MRLIOU_DEFS_H
#define MRLIOU_DEFS_H

/* ------------------------------------------------------------------ */
/* Mr.liou AI — core type definitions                                 */
/* All internal engine state is represented by the structs below.     */
/* ------------------------------------------------------------------ */

#include <stddef.h>
#include <string.h>
#include <time.h>
#include "config.h"

/* ---- UTF-8 safe clipping ------------------------------------------
   Fixed-size copies (strncpy to MRLIOU_MAX_KEY - 1, etc.) cut by byte,
   so a Chinese sentence longer than the buffer was stored with half a
   character at the end (2026-09-24: a 42-character sentence produced a
   key cut at byte 126, ending in 0xE6 0x9D 0xB1 0xE8). Call this after
   any fixed-size copy: it drops an incomplete trailing multi-byte
   sequence so the string ends on a whole character. Complete strings
   are left unchanged. */
static inline void mrliou_utf8_clip(char *s)
{
    size_t n = strlen(s);
    size_t i = n;
    size_t cont = 0;
    while (i > 0 && cont < 4 && (((unsigned char)s[i - 1]) & 0xC0) == 0x80) {
        i--;
        cont++;
    }
    if (i == 0) return;                       /* no lead byte: leave as is */
    unsigned char lead = (unsigned char)s[i - 1];
    size_t need;
    if (lead < 0x80)                 need = 1;
    else if ((lead & 0xE0) == 0xC0)  need = 2;
    else if ((lead & 0xF0) == 0xE0)  need = 3;
    else if ((lead & 0xF8) == 0xF0)  need = 4;
    else                             need = 0;
    if (need == cont + 1) return;             /* last character is complete */
    if (lead < 0x80) s[i] = '\0';             /* stray continuation bytes after ASCII */
    else             s[i - 1] = '\0';         /* incomplete sequence: drop it */
}

/* ---- Memory entry -------------------------------------------------
   Persistent knowledge unit stored in memory.txt as:
   KEY|VALUE|WEIGHT|TIMESTAMP
   ------------------------------------------------------------------ */
typedef struct {
    char    key[MRLIOU_MAX_KEY];
    char    value[MRLIOU_MAX_TEXT];
    float   weight;         /* relevance / confidence 0.0–1.0 */
    time_t  timestamp;
} MemoryEntry;

/* ---- Growth snapshot ----------------------------------------------
   Appended to growth.log after every learning cycle.
   One line per snapshot: VERSION|LEARNED|REASON_LVL|GEN_QUAL|TS|NOTES
   ------------------------------------------------------------------ */
typedef struct {
    int     version;
    int     total_learned;
    float   reasoning_level;    /* 0.0–1.0, increases with cycles */
    float   generation_quality; /* 0.0–1.0, improves over time */
    time_t  timestamp;
    char    notes[MRLIOU_MAX_KEY];
} GrowthSnapshot;

/* ---- Reasoning result --------------------------------------------- */
typedef struct {
    char    intent[256];            /* question / command / statement */
    char    keywords[MRLIOU_MAX_TEXT]; /* space-separated keyword list */
    char    inference[MRLIOU_MAX_TEXT];/* derived conclusion */
    float   confidence;             /* 0.0–1.0 */
    char    evidence[MRLIOU_MAX_TEXT]; /* supporting memory keys used */
} ReasoningResult;

/* ---- Learning result ---------------------------------------------- */
typedef struct {
    int     entries_added;
    int     entries_updated;
    char    summary[MRLIOU_MAX_TEXT];
} LearningResult;

/* ---- Generation result -------------------------------------------- */
typedef struct {
    char    output[MRLIOU_MAX_TEXT * 2];
    char    strategy[256];   /* e.g. "recall+expand", "infer+compose" */
    float   quality;         /* 0.0–1.0 */
} GenerationResult;

/* ---- HTTP request (parsed) ---------------------------------------- */
typedef struct {
    char    method[16];
    char    path[256];
    char    body[MRLIOU_BUF_SIZE];
    int     body_len;
} HttpRequest;

/* ---- HTTP response ------------------------------------------------ */
typedef struct {
    int     status_code;
    char    content_type[64];
    char    body[MRLIOU_BUF_SIZE];
    int     body_len;
} HttpResponse;

/* ---- Route handler type ------------------------------------------- */
typedef void (*RouteHandler)(const HttpRequest *req, HttpResponse *resp);

/* ---- Route entry -------------------------------------------------- */
typedef struct {
    char            method[16];
    char            path[256];
    RouteHandler    handler;
} Route;

/* ---- System state ------------------------------------------------- */
typedef struct {
    int             memory_count;
    int             growth_version;
    float           reasoning_level;
    float           generation_quality;
    long            requests_handled;
    time_t          started_at;
} SystemState;

#endif /* MRLIOU_DEFS_H */
