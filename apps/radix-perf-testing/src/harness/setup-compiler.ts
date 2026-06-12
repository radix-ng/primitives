// Loaded via test.setupFiles before any bench module is imported. Primitives are partially compiled
// and fall back to JIT under createApplication(), so the compiler must be present before any
// primitive/platform code evaluates its static initializers (see docs/adr/0009 risk + radix-ssr-testing).
import '@angular/compiler';
