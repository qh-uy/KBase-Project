package com.fsoft.kbase.util;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

public final class SlugUtils {

    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("\\s+");
    private static final Pattern MULTI_DASH = Pattern.compile("-+");

    private SlugUtils() {}

    public static String generateSlug(String input) {
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        String slug = NON_LATIN.matcher(
                WHITESPACE.matcher(normalized.toLowerCase(Locale.ROOT)).replaceAll("-")
        ).replaceAll("");
        return MULTI_DASH.matcher(slug).replaceAll("-").replaceAll("^-|-$", "");
    }

    public static String generateUniqueSlug(String input, java.util.function.Predicate<String> exists) {
        String base = generateSlug(input);
        String slug = base;
        int counter = 1;
        while (exists.test(slug)) {
            slug = base + "-" + counter++;
        }
        return slug;
    }
}
