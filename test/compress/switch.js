constant_switch_1: {
    options = { dead_code: true, evaluate: true };
    input: {
        switch (1+1) {
          case 1: foo(); break;
          case 1+1: bar(); break;
          case 1+1+1: baz(); break;
        }
    }
    expect: {
        bar();
    }
}

constant_switch_2: {
    options = { dead_code: true, evaluate: true };
    input: {
        switch (1) {
          case 1: foo();
          case 1+1: bar(); break;
          case 1+1+1: baz();
        }
    }
    expect: {
        foo();
        bar();
    }
}

constant_switch_3: {
    options = { dead_code: true, evaluate: true };
    input: {
        switch (10) {
          case 1: foo();
          case 1+1: bar(); break;
          case 1+1+1: baz();
          default:
            def();
        }
    }
    expect: {
        def();
    }
}

constant_switch_4: {
    options = { dead_code: true, evaluate: true };
    input: {
        switch (2) {
          case 1:
            x();
            if (foo) break;
            y();
            break;
          case 1+1:
            bar();
          default:
            def();
        }
    }
    expect: {
        bar();
        def();
    }
}

constant_switch_5: {
    options = { dead_code: true, evaluate: true };
    input: {
        switch (1) {
          case 1:
            x();
            if (foo) break;
            y();
            break;
          case 1+1:
            bar();
          default:
            def();
        }
    }
    expect: {
        // the break inside the if ruins our job
        // we can still get rid of irrelevant cases.
        switch (1) {
          case 1:
            x();
            if (foo) break;
            y();
        }
        // XXX: we could optimize this better by inventing an outer
        // labeled block, but that's kinda tricky.
    }
}

constant_switch_6: {
    options = { dead_code: true, evaluate: true };
    input: {
        OUT: {
            foo();
            switch (1) {
              case 1:
                x();
                if (foo) break OUT;
                y();
              case 1+1:
                bar();
                break;
              default:
                def();
            }
        }
    }
    expect: {
        OUT: {
            foo();
            x();
            if (foo) break OUT;
            y();
            bar();
        }
    }
}

constant_switch_7: {
    options = { dead_code: true, evaluate: true };
    input: {
        OUT: {
            foo();
            switch (1) {
              case 1:
                x();
                if (foo) break OUT;
                for (var x = 0; x < 10; x++) {
                    if (x > 5) break; // this break refers to the for, not to the switch; thus it
                                      // shouldn't ruin our optimization
                    console.log(x);
                }
                y();
              case 1+1:
                bar();
                break;
              default:
                def();
            }
        }
    }
    expect: {
        OUT: {
            foo();
            x();
            if (foo) break OUT;
            for (var x = 0; x < 10; x++) {
                if (x > 5) break;
                console.log(x);
            }
            y();
            bar();
        }
    }
}

constant_switch_8: {
    options = { dead_code: true, evaluate: true };
    input: {
        OUT: switch (1) {
          case 1:
            x();
            for (;;) break OUT;
            y();
            break;
          case 1+1:
            bar();
          default:
            def();
        }
    }
    expect: {
        OUT: {
            x();
            for (;;) break OUT;
            y();
        }
    }
}

constant_switch_9: {
    options = { dead_code: true, evaluate: true };
    input: {
        OUT: switch (1) {
          case 1:
            x();
            for (;;) if (foo) break OUT;
            y();
          case 1+1:
            bar();
          default:
            def();
        }
    }
    expect: {
        OUT: {
            x();
            for (;;) if (foo) break OUT;
            y();
            bar();
            def();
        }
    }
}

drop_default_1: {
    options = { dead_code: true };
    input: {
        switch (foo) {
          case 'bar': baz();
          default:
        }
    }
    expect: {
        switch (foo) {
          case 'bar': baz();
        }
    }
}

drop_default_2: {
    options = { dead_code: true };
    input: {
        switch (foo) {
          case 'bar': baz(); break;
          default:
            break;
        }
    }
    expect: {
        switch (foo) {
          case 'bar': baz();
        }
    }
}

keep_default: {
    options = { dead_code: true };
    input: {
        switch (foo) {
          case 'bar': baz();
          default:
            something();
            break;
        }
    }
    expect: {
        switch (foo) {
          case 'bar': baz();
          default:
            something();
        }
    }
}

issue_1663: {
    options = {
        dead_code: true,
        evaluate: true,
    }
    input: {
        var a = 100, b = 10;
        function f() {
            switch (1) {
              case 1:
                b = a++;
                return ++b;
              default:
                var b;
            }
        }
        f();
        console.log(a, b);
    }
    expect: {
        var a = 100, b = 10;
        function f() {
            var b;
            b = a++;
            return ++b;
        }
        f();
        console.log(a, b);
    }
    expect_stdout: true
}

drop_case: {
    options = {
        dead_code: true,
    }
    input: {
        switch (foo) {
          case 'bar': baz(); break;
          case 'moo':
            break;
        }
    }
    expect: {
        switch (foo) {
          case 'bar': baz();
        }
    }
}

keep_case: {
    options = {
        dead_code: true,
    }
    input: {
        switch (foo) {
          case 'bar': baz(); break;
          case moo:
            break;
        }
    }
    expect: {
        switch (foo) {
          case 'bar': baz(); break;
          case moo:
        }
    }
}

issue_376: {
    options = {
        dead_code: true,
        evaluate: true,
    }
    input: {
        switch (true) {
          case boolCondition:
            console.log(1);
            break;
          case false:
            console.log(2);
            break;
        }
    }
    expect: {
        switch (true) {
          case boolCondition:
            console.log(1);
        }
    }
}

issue_441_1: {
    options = {
        dead_code: true,
    }
    input: {
        switch (foo) {
          case bar:
            qux();
            break;
          case baz:
            qux();
            break;
          default:
            qux();
            break;
        }
    }
    expect: {
        switch (foo) {
          case bar:
          case baz:
          default:
            qux();
        }
    }
}

issue_441_2: {
    options = {
        dead_code: true,
    }
    input: {
        switch (foo) {
          case bar:
            // TODO: Fold into the case below
            qux();
            break;
          case fall:
          case baz:
            qux();
            break;
          default:
            qux();
            break;
        }
    }
    expect: {
        switch (foo) {
          case bar:
            qux();
            break;
          case fall:
          case baz:
          default:
            qux();
        }
    }
}

issue_1674: {
    options = {
        dead_code: true,
        evaluate: true,
    }
    input: {
        switch (0) {
          default:
            console.log("FAIL");
            break;
          case 0:
            console.log("PASS");
            break;
        }
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
}

issue_1679: {
    options = {
        dead_code: true,
        evaluate: true,
    }
    input: {
        var a = 100, b = 10;
        function f() {
            switch (--b) {
              default:
              case !function x() {}:
                break;
              case b--:
                switch (0) {
                  default:
                  case a--:
                }
                break;
              case (a++):
                break;
            }
        }
        f();
        console.log(a, b);
    }
    expect: {
        var a = 100, b = 10;
        function f() {
            switch (--b) {
              default:
              case !function x() {}:
                break;
              case b--:
                switch (0) {
                  default:
                  case a--:
                }
                break;
              case (a++):
            }
        }
        f();
        console.log(a, b);
    }
    expect_stdout: true
}

issue_1680_1: {
    options = {
        dead_code: true,
        evaluate: true,
    }
    input: {
        function f(x) {
            console.log(x);
            return x + 1;
        }
        switch (2) {
          case f(0):
          case f(1):
            f(2);
          case 2:
          case f(3):
          case f(4):
            f(5);
        }
    }
    expect: {
        function f(x) {
            console.log(x);
            return x + 1;
        }
        switch (2) {
          case f(0):
          case f(1):
            f(2);
          case 2:
            f(5);
        }
    }
    expect_stdout: [
        "0",
        "1",
        "2",
        "5",
    ]
}

issue_1680_2: {
    options = {
        dead_code: true,
    }
    input: {
        var a = 100, b = 10;
        switch (b) {
          case a--:
            break;
          case b:
            var c;
            break;
          case a:
            break;
          case a--:
            break;
        }
        console.log(a, b);
    }
    expect: {
        var a = 100, b = 10;
        switch (b) {
          case a--:
            break;
          case b:
            var c;
            break;
          case a:
          case a--:
        }
        console.log(a, b);
    }
    expect_stdout: true
}

issue_1690_1: {
    options = {
        dead_code: true,
    }
    input: {
        switch (console.log("PASS")) {}
    }
    expect: {
        console.log("PASS");
    }
    expect_stdout: "PASS"
}

issue_1690_2: {
    options = {
        dead_code: false,
    }
    input: {
        switch (console.log("PASS")) {}
    }
    expect: {
        switch (console.log("PASS")) {}
    }
    expect_stdout: "PASS"
}
