/////////////////////////////////// Variables //////////////////////////////////
var studies = [];                                                           // Array of loaded studies
var subjects = [];                                                          // Array of selected subjects
var lastLoadedSubjects = [];                                                // Array of last loaded subjects
var ranges = [];                                                            // Array of ranges of selected subjects
var lessons = [];                                                           // Array of lessons of selected subjects
var file = { "sem": "", "studies": [], "grades": [],
             "subjects": [], "custom": [], "selected": [], "deleted": [] }; // File cache
var year = (new Date()).getMonth()+1 >= 8  ? (new Date()).getFullYear() : (new Date()).getFullYear() - 1; // ac. year (from august display next ac. year)


///////////////////////////////////// Main /////////////////////////////////////
$(document).ready(function() {
    // Semester radio auto select
    var d = new Date();
    if(d.getMonth() === 11 || d.getMonth() < 4) {
        $(".menu_sem_radio[value='summer']").prop("checked", true);
    } else {
        $(".menu_sem_radio[value='winter']").prop("checked", true);
    }

    // Start menu load
    loadStudies();

    // Load local storage
    loadLocalStorage();
}); // checked

//////////////////////////////////// Events ////////////////////////////////////
// Icons
$(document).on("click", ".header_info_icon", function() {
    $(".header_info_icon").addClass("hidden");
    $(".header_cross_icon").removeClass("hidden");

    $(".secs_main").addClass("hidden");
    $(".secs_info").removeClass("hidden");
}); // checked
$(document).on("click", ".header_cross_icon", function() {
    $(".header_info_icon").removeClass("hidden");
    $(".header_cross_icon").addClass("hidden");

    $(".secs_main").removeClass("hidden");
    $(".secs_info").addClass("hidden");
}); // checked
$(document).on("click", ".menu_icon", function() {
    $(".menu_icon").addClass("hidden");

    $(".secs").removeClass("secs_menu_hidden");
    $(".menu").removeClass("hidden");
}); // checked
$(document).on("click", ".menu_cross_icon", function() {
    $(".menu_icon").removeClass("hidden");

    $(".secs").addClass("secs_menu_hidden");
    $(".menu").addClass("hidden");
}); // checked

// Menu
$(document).on("change", ".menu_years", function(e) {
    year = Number($(this).val());
    studies = subjects = lastLoadedSubjects = ranges = lessons = [];
    file = { "sem": "", "studies": [], "grades": [],
        "subjects": [], "custom": [], "selected": [], "deleted": [] }; // File cache
    loadStudies();
    loadLessons();
});
$(document).on("click", ".menu_sem_radio", function() {
    $(".menu_com_search_input").prop("value", ""); $(".menu_com_search_input").trigger("keyup");
    $(".menu_opt_search_input").prop("value", ""); $(".menu_opt_search_input").trigger("keyup");
    renderSubjects();
}); // checked
$(document).on("click", ".menu_bit_checkbox", function() {
    $(".menu_com_search_input").prop("value", ""); $(".menu_com_search_input").trigger("keyup");
    $(".menu_opt_search_input").prop("value", ""); $(".menu_opt_search_input").trigger("keyup");
    renderSubjects();
}); // checked
$(document).on("click", ".menu_mit_radio", function() {
    // Can uncheck
    if($(this).hasClass("mit_radio_checked")) {
        $(".menu_mit_radio").removeClass("mit_radio_checked");
        $(this).prop("checked", false);
    } else {
        $(".menu_mit_radio").removeClass("mit_radio_checked");
        $(this).addClass("mit_radio_checked");
    }

    $(".menu_com_search_input").prop("value", ""); $(".menu_com_search_input").trigger("keyup");
    $(".menu_opt_search_input").prop("value", ""); $(".menu_opt_search_input").trigger("keyup");
    renderSubjects();
}); // checked
$(document).on("click", ".menu_grade_checkbox", function() {
    $(".menu_com_search_input").prop("value", ""); $(".menu_com_search_input").trigger("keyup");
    $(".menu_opt_search_input").prop("value", ""); $(".menu_opt_search_input").trigger("keyup");
    renderSubjects();
}); // checked
$(document).on("click", ".menu_sub_checkbox", function() {
    renderSubjects();
}); // checked
$(document).on("click", ".menu_sel_checkbox", function() {
    renderSubjects();
}); // checked
$(document).on("keyup", ".menu_com_search_input", function() {
    $(".menu_com_column .menu_column_row").removeClass("hidden_search");
    if($(".menu_com_search_input").prop("value") != "") {
        $(".menu_com_column .menu_column_row").addClass("hidden_search");
        $(".menu_com_column .menu_column_row").each(function(i, sub) {
            if($(sub).children(".menu_column_row_text").length > 0) {
                if($(sub).children(".menu_column_row_text").html().toUpperCase().includes($(".menu_com_search_input").prop("value").toUpperCase())) {
                    $(sub).removeClass("hidden_search");
                }
            }
        });
    }
}); // checked
$(document).on("keyup", ".menu_opt_search_input", function() {
    $(".menu_opt_column .menu_column_row").removeClass("hidden_search");
    if($(".menu_opt_search_input").prop("value") != "") {
        $(".menu_opt_column .menu_column_row").addClass("hidden_search");
        $(".menu_opt_column .menu_column_row").each(function(i, sub) {
            if($(sub).children(".menu_column_row_text").length > 0) {
                if($(sub).children(".menu_column_row_text").html().toUpperCase().includes($(".menu_opt_search_input").prop("value").toUpperCase())) {
                    $(sub).removeClass("hidden_search");
                }
            }
        });
    }
}); // checked
$(document).on("click", ".secs_header_elem", function() {
    $(".secs_header_elem").removeClass("secs_header_elem_selected");
    $(".sec").addClass("sec_invisible");

    $(this).addClass("secs_header_elem_selected");
    if($(this).hasClass("ch_0")) {
        $(".se_0").removeClass("sec_invisible");
    } else if($(this).hasClass("ch_1")) {
        $(".se_1").removeClass("sec_invisible");
    } else if($(this).hasClass("ch_2")) {
        $(".se_2").removeClass("sec_invisible");
    }
}); // checked

// Controls
$(document).on("click", ".menu_submit_button", function() {
    loadLessons();
    storeLocalStorage();
}); // checked
$(document).on("click", ".menu_save_ical_button", function() {
    exportICal();
}); // checked
$(document).on("click", ".menu_save_json_button", function() {
    downloadJSON();
}); // checked
$(document).on("click", ".menu_load_json_button", function() {
    $(".json_load_input").trigger("click");
}); // checked
$(document).on("change", ".json_load_input", function() {
    loadJSON();
}); // checked

// Schedule
$(document).on("click", ".schedule_cell_star", function() {
    // Update
    var les = lessons.find(x => x.id === $(this).siblings(".id").html());
    if(les.selected === true) {
        les.selected = false;
    } else {
        les.selected = true;
    }

    // Render
    storeLocalStorage();
    renderAll();
}); // checked
$(document).on("click", ".schedule_cell_bin", function() {
    // Update
    var les = lessons.find(x => x.id === $(this).siblings(".id").html());
    if(les.type === "custom") {
        lessons = lessons.filter(x => x.id !== $(this).siblings(".id").html());
    } else {
        if(les.deleted === true) {
            les.deleted = false;
        } else {
            les.deleted = true;
        }
    }

    // Render
    storeLocalStorage();
    renderAll();
}); // checked
$(document).on("click", ".lesson_add_card_button", function() {
    // New lesson
    var lesson = {
        "id": "CUST_" + makeHash("custom" + Date.now()),
        "name": $(".lesson_add_card_name").val(),
        "link": "0-" + $(".lesson_add_card_name").val(),
        "day":  +$(".lesson_add_card_day").val(),
        "week": $(".lesson_add_card_week").val(),
        "from": +$(".lesson_add_card_from").val(),
        "to": +$(".lesson_add_card_to").val(),
        "type": "custom",
        "custom_color": $(".lesson_add_card_color").val(),
        "rooms": [$(".lesson_add_card_room").val()],
        "layer": 1,
        "selected": false,
        "deleted": false
    };

    // Check
    if(lesson.from >= lesson.to) {
        return;
    }
    if(typeof lesson.name === "undefined" || lesson.name === "") {
        return;
    }
    if(typeof lesson.rooms[0] === "undefined" || lesson.rooms[0] === "") {
        return;
    }

    // Push
    lessons.push(lesson);
    storeLocalStorage();
    renderAll();
});

///////////////////////////////////// Menu /////////////////////////////////////
function loadYears(e) {
    if ($(".menu_years").find("option").length)
        return;

    let years = [];
    $(e).find("select#year").find("option").each(function (i, opt) {
        years.push({value: Number($(opt).prop('value')), name: $(opt).text()});
    });

    // Generate
    $(".menu_years").html("");
    if (years.length === 0)
        $(".menu_years").append(` <option value="` + year + `" selected>` + year + `/` + (year+1) + `</option>`);
    else
        $.each(years, function(i, y) {
            $(".menu_years").append(` <option value="` + y.value + `" ` + (year === y.value ? "selected" : "") + `>` + y.name + `</option>`);
        });
}
function loadStudies(e) {
    // Title
    $(".loading_message").html("Načítám studia...");

    // AJAX
    studies = [];
    $.ajax({
        url: "./load.php",
        method: "POST",
        data: {
            "a": "s",
            "b": "",
            "c": "",
            "y": year,
        },
        async: false,
        success: function(e) {
            // Parse BIT
            studies.push({
                "name": "BIT",
                "link": parseLinkforLoadPHP($(e).find("div#bc").find("li.c-programmes__item").first().find("a.b-programme__link").prop("href")),
                "subjects": {
                    "com": [
                        [], [], []
                    ],
                    "opt": [
                        [], [], []
                    ]
                }
            });

            // Parse MIT
            $(e).find("div#mgr").find("li.c-programmes__item").find("li.c-branches__item").each(function(i, li) {

                // only new mgr program
                if (!$(li).find("span.tag").html().startsWith('N'))
                    return;

                studies.push({
                    "name": "MIT-" + $(li).find("span.tag").html(),
                    "link": parseLinkforLoadPHP($(li).find("a.b-branch__link").prop("href")),
                    "subjects": {
                        "com": [
                            [], [], []
                        ],
                        "opt": [
                            [], [], []
                        ]
                    }
                });
            });

            // Generate
            $(".menu_stud_column").html("");
            $.each(studies, function(i, stud) {
                if(stud.name === "BIT") {
                    $(".menu_stud_column").append(` <div class="menu_column_row">
                                                        <input class="menu_column_row_checkbox menu_bit_checkbox" type="checkbox" value="BIT">
                                                        <div class="menu_column_row_text">BIT</div>
                                                        <div class="cleaner"></div>
                                                    </div>`);
                } else {
                    $(".menu_stud_column").append(` <div class="menu_column_row">
                                                        <input class="menu_column_row_radio menu_mit_radio" type="radio" name="mit_grade" value="` + stud.name + `">
                                                        <div class="menu_column_row_text">` + stud.name + `</div>
                                                        <div class="cleaner"></div>
                                                    </div>`);
                }
            });

            // Load academic years
            loadYears(e);

            // Start load subjects
            loadSubjects();
        },
        error: function() {
            $(".loading_message").html("Chyba při načítání studií...");
        }
    });
} // checked
function loadSubjects(e) {
    // Load
    $.each(studies, function(i, stud) {
        // Title
        $(".loading_message").html("Načítám předměty studia " + stud.name + "...");

        // AJAX
        stud.subjects.com = [ [], [], [] ];
        stud.subjects.opt = [ [], [], [] ];
        $.ajax({
            url: "./load.php",
            method: "POST",
            data: {
                "a": "u",
                "b": stud.link.split("-")[0],
                "c": stud.link.split("-")[1]
            },
            async: false,
            success: function(e) {
                // Parse
                var sem = "winter";
                var grade = 0;
                $(e).find("main").first().find("div.table-responsive").first().find("tbody").each(function(o, tbody) {
                    $(tbody).children("tr").each(function(p, tr) {
                        // Subject
                        var subject = {
                            "name": $(tr).children("th").html(),
                            "sem": sem,
                            "link": parseLinkforLoadPHP($(tr).children("td").first().children("a").prop("href"))
                        }

                        // Push
                        if($(tr).css("background-color") === "rgb(255, 228, 192)") {
                            stud.subjects.com[grade].push(subject);
                        } else {
                            stud.subjects.opt[grade].push(subject);
                        }
                    });

                    // Inc
                    if(sem === "winter") {
                        sem = "summer";
                    } else {
                        sem = "winter";
                        grade++;
                    }
                });
            }
        });
    });

    // Generate
    $(".menu_com_column").html("");
    $(".menu_opt_column").html("");
    $.each(studies, function(i, stud) {
        for(var grade = 0; grade < 3; grade++) {
            // Name
            var name = stud.name;
            if(grade <= 1 || name === "BIT") {
                name += " " + (grade + 1);
            } else {
                name += " lib.";
            }

            // Com
            $(".menu_com_column").append(`  <div class="menu_column_row mrsub_` + grade + `_` + stud.name + ` hidden">
                                                <div class="menu_column_row_text_split">
                                                    <div class="menu_column_row_text_split_inner">` + name + `</div>
                                                </div>
                                            </div>`);
            $.each(stud.subjects.com[grade], function(o, sub) {
                $(".menu_com_column").append(`  <div class="menu_column_row mrsub_` + grade + `_` + stud.name + ` mrsem_` + sub.sem + ` hidden">
                                                    <input class="menu_column_row_checkbox menu_sub_checkbox" type="checkbox" value="` + sub.link + `">
                                                    <div class="menu_column_row_text">` + sub.name + `</div>
                                                    <div class="cleaner"></div>
                                                </div>`);
            });

            // Opt
            $(".menu_opt_column").append(`  <div class="menu_column_row mrsub_` + grade + `_` + stud.name + ` hidden">
                                                <div class="menu_column_row_text_split">
                                                    <div class="menu_column_row_text_split_inner">` + name + `</div>
                                                </div>
                                            </div>`);
            $.each(stud.subjects.opt[grade], function(o, sub) {
                $(".menu_opt_column").append(`  <div class="menu_column_row mrsub_` + grade + `_` + stud.name + ` mrsem_` + sub.sem + ` hidden">
                                                    <input class="menu_column_row_checkbox menu_sub_checkbox" type="checkbox" value="` + sub.link + `">
                                                    <div class="menu_column_row_text">` + sub.name + `</div>
                                                    <div class="cleaner"></div>
                                                </div>`);
            });
        }
    });

    // Done
    $(".header_info_icon").removeClass("hidden");
    $(".header_cross_icon").addClass("hidden");
    $(".menu").removeClass("hidden");
    $(".secs").removeClass("hidden");
    $(".loading_message").html("");
    $(".loading_message").addClass("hidden");

    // Render
    renderSubjects();
} // checked
function renderSubjects() {
    // Grades render
    if($(".menu_bit_checkbox:checked").length > 0) {
        $(".menu_grade_checkbox[value='0_BIT']").parent().removeClass("hidden");
        $(".menu_grade_checkbox[value='1_BIT']").parent().removeClass("hidden");
        $(".menu_grade_checkbox[value='2_BIT']").parent().removeClass("hidden");
    } else {
        $(".menu_grade_checkbox[value='0_BIT']").parent().addClass("hidden");
        $(".menu_grade_checkbox[value='1_BIT']").parent().addClass("hidden");
        $(".menu_grade_checkbox[value='2_BIT']").parent().addClass("hidden");
    }
    if($(".menu_mit_radio:checked").length > 0) {
        $(".menu_grade_checkbox[value='0_MIT']").parent().removeClass("hidden");
        $(".menu_grade_checkbox[value='1_MIT']").parent().removeClass("hidden");
    } else {
        $(".menu_grade_checkbox[value='0_MIT']").parent().addClass("hidden");
        $(".menu_grade_checkbox[value='1_MIT']").parent().addClass("hidden");
    }

    // Render groups
    var groups = [];
    var bitSelected = false;
    var mitSelected = false;
    $(".menu_grade_checkbox:checked").each(function(i, grade) {
        if(!$(grade).parent().hasClass("hidden")) {
            if($(grade).prop("value").includes("BIT")) {
                bitSelected = true;
                groups.push($(grade).prop("value").split("_")[0] + "_" + $(".menu_bit_checkbox:checked").prop("value"));
            } else {
                mitSelected = true;
                groups.push($(grade).prop("value").split("_")[0] + "_" + $(".menu_mit_radio:checked").prop("value"));
            }
        }
    });
    if(mitSelected) {
        groups.push("2_" + $(".menu_mit_radio:checked").prop("value"));
    }

    // Searches render
    if(bitSelected || mitSelected) {
        $(".menu_com_search_input").removeClass("hidden");
        $(".menu_opt_search_input").removeClass("hidden");
    } else {
        $(".menu_com_search_input").addClass("hidden");
        $(".menu_opt_search_input").addClass("hidden");
    }

    // Subjects render
    $(".menu_com_column .menu_column_row").addClass("hidden");
    $(".menu_opt_column .menu_column_row").addClass("hidden");
    $.each(groups, function(i, group) {
        $(".mrsub_" + group).removeClass("hidden");
    })
    if($(".menu_sem_radio:checked").prop("value") == "winter") {
        $(".mrsem_summer").addClass("hidden");
    } else {
        $(".mrsem_winter").addClass("hidden");
    }

    // Selected render
    $(".menu_sel_checkbox:not(:checked)").each(function(i, sub) {
        $(".menu_sub_checkbox[value='" + $(sub).prop("value") + "']").prop("checked", false);
    });
    $(".menu_sel_column").html("");
    $(".menu_sub_checkbox:checked").each(function(o, sub) {
        if(!$(sub).parent().hasClass("hidden")) {
            $(".menu_sel_column").append(`  <div class="menu_column_row">
                                                <input class="menu_column_row_checkbox menu_sel_checkbox" type="checkbox" value="` + $(sub).prop("value") + `" checked="checked">
                                                <div class="menu_column_row_text">` + $(sub).siblings(".menu_column_row_text").html() + `</div>
                                                <div class="cleaner"></div>
                                            </div>`);
        }
    });
} // checked

/////////////////////////////////// Schledule //////////////////////////////////
function loadLessons() {
    // Info
    {
        $(".header_info_icon").addClass("hidden");
        $(".header_cross_icon").addClass("hidden");
        $(".secs_main").removeClass("hidden");
        $(".secs_info").addClass("hidden");

        $(".menu_column_row_checkbox").prop("disabled", true);
        $(".menu_column_row_radio").prop("disabled", true);
        $(".menu_button").prop("disabled", true);
        $(".menu_button").addClass("menu_button_disabled");

        $(".loading_message").html("Načítání...");
        $(".loading_message").removeClass("hidden");
        $(".secs").addClass("hidden");
    }

    // Make file
    {
        // Year
        file.year = year;

        // Sem
        file.sem = $(".menu_sem_radio:checked").prop("value");

        // Study
        file.studies = [];
        if($(".menu_bit_checkbox:checked").length > 0) {
            file.studies.push($(".menu_bit_checkbox:checked").prop("value"));
        }
        if($(".menu_mit_radio:checked").length > 0) {
            file.studies.push($(".menu_mit_radio:checked").prop("value"));
        }

        // Grades
        file.grades = [];
        $.each($(".menu_grade_checkbox:checked"), function(i, grade) {
            file.grades.push($(grade).prop("value"));
        });

        // Subjects
        file.subjects = [];
        $.each($(".menu_sel_checkbox"), function(i, sub) {
            file.subjects.push($(sub).siblings(".menu_column_row_text").html());
        });
    }

    // Subjects fill
    subjects = [];
    $(".menu_sel_checkbox").each(function(i, sub) {
        subjects.push({
            "name": $(sub).siblings(".menu_column_row_text").html(),
            "link": $(sub).prop("value"),
            "range": ""
        });
    });

    // Load
    var tempLessons = [];
    $.each(subjects, function(i, sub) {
        tempLessons = tempLessons.concat(lessons.filter(x => x.name === sub.name && x.type != "custom"));
    });
    tempLessons = tempLessons.concat(lessons.filter(x => x.type === "custom"));
    lessons = tempLessons;
    $.each(subjects, function(i, sub) {
        // Title
        $(".loading_message").html("Načítám " + sub.name + "...");

        // AJAX
        $.ajax({
            url: "./load.php",
            method: "POST",
            data: {
                "a": "u",
                "b": sub.link.split("-")[0],
                "c": sub.link.split("-")[1]
            },
            async: false,
            success: function(e) {
                // Range
                sub.range = $(e).find("main").find("div.b-detail__body").find("div.grid__cell").find("p:contains('Rozsah')").parent().next().children().html();

                // Already loaded
                if(typeof lastLoadedSubjects.find(x => x.name === sub.name) !== "undefined") {
                    return;
                }

                // Lessons
                $(e).find("table#schedule").find("tbody").find("tr").each(function(o, tr) {
                    if(($(tr).children("td").eq(0).html().includes("přednáška") || $(tr).children("td").eq(0).html().includes("poč. lab") || $(tr).children("td").eq(0).html().includes("cvičení") || $(tr).children("td").eq(0).html().includes("laboratoř")) &&
                       ($(tr).children("td").eq(1).html().includes("výuky") || $(tr).children("td").eq(1).html().includes("sudý") || $(tr).children("td").eq(1).html().includes("lichý"))) {
                        // Lesson
                        var lesson = {
                            "id": "",
                            "name": sub.name,
                            "link": sub.link,
                            "day":  parseDay($(tr).children("th").html()),
                            "week": parseWeek($(tr).children("td").eq(1).html()),
                            "from": parseTimeFrom($(tr).children("td").eq(3).html()),
                            "to":   parseTimeTo($(tr).children("td").eq(4).html()),
                            "type": "unknown",
                            "rooms": [],
                            "layer": 1,
                            "selected": false,
                            "deleted": false
                        };

                        // Type
                        if($(tr).children("td").eq(0).html() === "přednáška") {
                            lesson.type = "green";
                        } else if($(tr).children("td").eq(0).html() === "cvičení") {
                            lesson.type = "blue";
                        } else if($(tr).children("td").eq(0).html() === "poč. lab") {
                            lesson.type = "yellow";
                        } else if($(tr).children("td").eq(0).html() === "laboratoř") {
                            lesson.type = "yellow";
                        }

                        // Rooms
                        $.each($(tr).children("td").eq(2).children("a"), function(p, a) {
                            lesson.rooms.push($(a).html().trim());
                        });
                        if(lesson.rooms.includes("E112") && lesson.rooms.includes("E104") && lesson.rooms.includes("E105")) {
                            lesson.rooms = lesson.rooms.filter(x => x !== "E112" && x !== "E104" && x !== "E105");
                            lesson.rooms.push("E112+4,5");
                        }
                        if(lesson.rooms.includes("E112") && lesson.rooms.includes("E104")) {
                            lesson.rooms = lesson.rooms.filter(x => x !== "E112" && x !== "E104");
                            lesson.rooms.push("E112+4");
                        }
                        if(lesson.rooms.includes("E112") && lesson.rooms.includes("E105")) {
                            lesson.rooms = lesson.rooms.filter(x => x !== "E112" && x !== "E105");
                            lesson.rooms.push("E112+5");
                        }
                        if(lesson.rooms.includes("D105") && lesson.rooms.includes("D0206") && lesson.rooms.includes("D0207")) {
                            lesson.rooms = lesson.rooms.filter(x => x !== "D105" && x !== "D0206" && x !== "D0207");
                            lesson.rooms.push("D105+6,7");
                        }
                        if(lesson.rooms.includes("D105") && lesson.rooms.includes("D0206")) {
                            lesson.rooms = lesson.rooms.filter(x => x !== "D105" && x !== "D0206");
                            lesson.rooms.push("D105+6");
                        }
                        if(lesson.rooms.includes("D105") && lesson.rooms.includes("D0207")) {
                            lesson.rooms = lesson.rooms.filter(x => x !== "D105" && x !== "D0207");
                            lesson.rooms.push("D105+7");
                        }
                        if(lesson.rooms.includes("N103") && lesson.rooms.includes("N104") && lesson.rooms.includes("N105")) {
                            lesson.rooms = lesson.rooms.filter(x => x !== "N103" && x !== "N104" && x !== "N105");
                            lesson.rooms.push("N103,4,5");
                        }
                        if(lesson.rooms.includes("N103") && lesson.rooms.includes("N104")) {
                            lesson.rooms = lesson.rooms.filter(x => x !== "N103" && x !== "N104");
                            lesson.rooms.push("N103,4");
                        }
                        if(lesson.rooms.includes("N104") && lesson.rooms.includes("N105")) {
                            lesson.rooms = lesson.rooms.filter(x => x !== "N104" && x !== "N105");
                            lesson.rooms.push("N104,5");
                        }

                        // ID
                        lesson.id = "LOAD_" + makeHash(lesson.name + ";" + lesson.day + ";" + lesson.week + ";" + lesson.from + ";" + lesson.to + ";" + lesson.type + ";" + JSON.stringify(lesson.rooms));

                        // Push
                        lessons.push(lesson);
                    }
                });
            }
        });
    });
    lastLoadedSubjects = subjects;

    // Parse ranges
    ranges = [];
    $.each(subjects, function(i, sub) {
        // Split ranges
        var rangeRaw = sub.range;
        var greenRange = 0;
        var blueRange = 0;
        var yellowRange = 0;

        rangeRaw = rangeRaw.replaceAll("\\n", "");
        rangeRaw = rangeRaw.replaceAll("hod. ", "");
        rangeRaw = rangeRaw.trim();
        $.each(rangeRaw.split(","), function(i, rang) {
            rang = rang.trim();

            if(rang.split(" ")[1].trim() === "přednášky") {
                greenRange = +rang.split(" ")[0].trim();
            } else if(rang.split(" ")[1].trim() === "cvičení") {
                blueRange = +rang.split(" ")[0].trim();
            } else if(rang.split(" ")[1].trim() === "pc") {
                yellowRange = +rang.split(" ")[0].trim();
            } else if(rang.split(" ")[1].trim() === "laboratoře") {
                yellowRange = +rang.split(" ")[0].trim();
            }
        });

        // Find lengths
        var greenLength = 0;
        var blueLength = 0;
        var yellowLength = 0;

        greenLength = greenRange / 13;
        var blueLesson = lessons.find(x => x.name === sub.name && x.type === "blue");
        if(typeof blueLesson != "undefined" && blueRange > 0) {
            blueLength = blueLesson.to - blueLesson.from;
        }
        var yellowLesson = lessons.find(x => x.name === sub.name && x.type === "yellow");
        if(typeof yellowLesson != "undefined" && yellowRange > 0) {
            yellowLength = yellowLesson.to - yellowLesson.from;
        }

        // Calculate ranges
        var greenCount = 0;
        var blueCount = 0
        var yellowCount = 0
        if(greenLength > 0) {
            greenCount = 13;
        }
        if(blueLength > 0) {
            blueCount = blueRange / blueLength;
        }
        if(yellowLength > 0) {
            yellowCount = yellowRange / yellowLength;
        }

        // Push
        var range = {
            "name": sub.name,
            "link": sub.link,
            "raw": sub.range.replaceAll("\\n", "").trim(),
            "greenLength": greenLength,
            "blueLength": blueLength,
            "yellowLength": yellowLength,
            "greenCount": greenCount,
            "blueCount": blueCount,
            "yellowCount": yellowCount
        };
        ranges.push(range);
    });

    // Done
    $(".header_info_icon").removeClass("hidden");

    $(".menu_column_row_checkbox").prop("disabled", false);
    $(".menu_column_row_radio").prop("disabled", false);
    $(".menu_button").prop("disabled", false);
    $(".menu_button").removeClass("menu_button_disabled");

    $(".loading_message").html("");
    $(".loading_message").addClass("hidden");
    $(".secs").removeClass("hidden");

    // Render
    renderAll();
} // checked

function renderAll() {
    // Sort
    lessons.sort(function(a, b) {
        if(a.type === "green" && b.type !== "green") {
            return -1;
        } else if(a.type !== "green" && b.type === "green") {
            return 1;
        }

        if(a.type === "blue" && b.type !== "blue") {
            return -1;
        } else if(a.type !== "blue" && b.type === "blue") {
            return 1;
        }

        if(a.name < b.name) {
            return -1;
        } else if(a.name > b.name) {
            return 1;
        }

        return 0;
    });

    // Render
    renderSchedule();
    renderScheduleFin();
    renderRanges();
} // checked
function renderSchedule() {
    // Push lessons
    var schedule = [[], [], [], [], []];
    $.each(lessons, function(i, les) {
        // Reinit
        les.layer = 1;

        // Collisions
        do {
            var collison = false;
            $.each(schedule[les.day], function(o, lesX) {
                if(les.layer === lesX.layer) {
                    if(doLessonsCollide(les.from, les.to, lesX.from, lesX.to)) {
                        collison = true;
                        les.layer++;
                    }
                }
            });
        } while(collison === true);

        // Push
        schedule[les.day].push(les);
    });

    // Layers count
    var scheduleLayersCount = [1, 1, 1, 1, 1];
    for(d = 0; d < 5; d++) {
        var maxLayer = 1;
        $.each(schedule[d], function(i, les) {
            if(les.layer > maxLayer) {
                maxLayer = les.layer;
            }
        });
        scheduleLayersCount[d] = maxLayer;
    }

    // Prepare schedule rows
    for(d = 0; d < 5; d++) {
        $(".schedule_all").find(".schedule_row").eq(d).children(".schedule_row_layers").html("");
        for(l = 0; l < scheduleLayersCount[d]; l++) {
            $(".schedule_all").find(".schedule_row").eq(d).children(".schedule_row_layers").append(`<div class="schedule_row_layer"></div>`);
        }

        $(".schedule_all").find(".schedule_row").eq(d).children(".schedule_row_header").css("line-height", (scheduleLayersCount[d] * 72 + 6) + "px");
    }

    // Generation of cells
    for(d = 0; d < 5; d++) {
        var fullLength = +$(".schedule_all").find(".schedule_row").eq(d).children(".schedule_row_layers").width();

        $.each(schedule[d], function(i, les) {
            var length = ((les.to - les.from) * (fullLength / 14)) - 6 - 6;
            var left = (les.from * (fullLength / 14)) + 3;

            var classes = "";
            if(les.type === "green") {
                classes += "schedule_cell_type_green ";
            } else if(les.type === "blue") {
                classes += "schedule_cell_type_blue ";
            } else if(les.type === "yellow") {
                classes += "schedule_cell_type_yellow ";
            } else if(les.type === "custom") {
                classes += "schedule_cell_type_" + les.custom_color + " ";
            }
            if(les.week.includes("lichý")) {
                classes += "schedule_cell_week_odd ";
            } else if(les.week.includes("sudý")) {
                classes += "schedule_cell_week_even ";
            }
            if(les.selected === true) {
                classes += "schedule_cell_selected ";
            }
            if(les.deleted === true) {
                classes += "schedule_cell_deleted ";
            }

            var rooms = "";
            $.each(les.rooms, function(i, room) {
                rooms += room + " ";
            });

            var layerDiv = $(".schedule_all").find(".schedule_row").eq(d).children(".schedule_row_layers").children(".schedule_row_layer").eq(les.layer - 1);
            $(layerDiv).append(`<div class="schedule_cell ` + classes + `" style="left: ` + left + `px; width: ` + length + `px">
                                    <div class="schedule_cell_name"><a target="_blank" href="https://www.fit.vut.cz/study/course/` + les.link.split("-")[1] + `">` + les.name + `</a></div>
                                    <div class="schedule_cell_rooms">` + rooms + `</div>
                                    <div class="schedule_cell_desc">` + les.week + `</div>
                                    <div class="schedule_cell_star"></div>
                                    <div class="schedule_cell_bin"></div>
                                    <div class="id hidden">` + les.id + `</div>
                                </div>`);
        });
    }
} // checked
function renderScheduleFin() {
    // Push lessons
    var schedule = [[], [], [], [], []];
    $.each(lessons, function(i, les) {
        if(les.selected == true) {
            // Reinit
            les.layer = 1;

            // Collisions
            do {
                var collison = false;
                $.each(schedule[les.day], function(o, lesX) {
                    if(les.layer === lesX.layer) {
                        if(doLessonsCollide(les.from, les.to, lesX.from, lesX.to)) {
                            collison = true;
                            les.layer++;
                        }
                    }
                });
            } while(collison === true);

            // Push
            schedule[les.day].push(les);
        }
    });

    // Layers count
    var scheduleLayersCount = [1, 1, 1, 1, 1];
    for(d = 0; d < 5; d++) {
        var maxLayer = 1;
        $.each(schedule[d], function(i, les) {
            if(les.layer > maxLayer) {
                maxLayer = les.layer;
            }
        });
        scheduleLayersCount[d] = maxLayer;
    }

    // Prepare schedule rows
    for(d = 0; d < 5; d++) {
        $(".schedule_fin").find(".schedule_row").eq(d).children(".schedule_row_layers").html("");
        for(l = 0; l < scheduleLayersCount[d]; l++) {
            $(".schedule_fin").find(".schedule_row").eq(d).children(".schedule_row_layers").append(`<div class="schedule_row_layer"></div>`);
        }

        $(".schedule_fin").find(".schedule_row").eq(d).children(".schedule_row_header").css("line-height", (scheduleLayersCount[d] * 72 + 6) + "px");
    }

    // Generation of cells
    for(d = 0; d < 5; d++) {
        var fullLength = +$(".schedule_fin").find(".schedule_row").eq(d).children(".schedule_row_layers").width();

        $.each(schedule[d], function(i, les) {
            var length = ((les.to - les.from) * (fullLength / 14)) - 6 - 6;
            var left = (les.from * (fullLength / 14)) + 3;

            var classes = "";
            if(les.type === "green") {
                classes += "schedule_cell_type_green ";
            } else if(les.type === "blue") {
                classes += "schedule_cell_type_blue ";
            } else if(les.type === "yellow") {
                classes += "schedule_cell_type_yellow ";
            } else if(les.type === "custom") {
                classes += "schedule_cell_type_" + les.custom_color + " ";
            }
            if(les.week.includes("lichý")) {
                classes += "schedule_cell_week_odd ";
            } else if(les.week.includes("sudý")) {
                classes += "schedule_cell_week_even ";
            }

            var rooms = "";
            $.each(les.rooms, function(i, room) {
                rooms += room + " ";
            });

            var layerDiv = $(".schedule_fin").find(".schedule_row").eq(d).children(".schedule_row_layers").children(".schedule_row_layer").eq(les.layer - 1);
            $(layerDiv).append(`<div class="schedule_cell schedule_cell_selected ` + classes + `" style="left: ` + left + `px; width: ` + length + `px">
                                    <div class="schedule_cell_name"><a target="_blank" href="https://www.fit.vut.cz/study/course/` + les.link.split("-")[1] + `">` + les.name + `</a></div>
                                    <div class="schedule_cell_rooms">` + rooms + `</div>
                                    <div class="schedule_cell_desc">` + les.week + `</div>
                                </div>`)
        });
    }
} // checked
function renderRanges() {
    $(".ranges").html("");
    $.each(ranges, function(i, rang) {
        // Sum values
        var sumGreenValue = 0;
        var sumBlueValue = 0;
        var sumYellowValue = 0;
        $.each(lessons.filter(x => x.name == rang.name && x.selected === true && x.type == "green"), function(o, les) {
            sumGreenValue += les.to - les.from;
        });
        $.each(lessons.filter(x => x.name == rang.name && x.selected === true && x.type == "blue"), function(o, les) {
            sumBlueValue += les.to - les.from;
        });
        $.each(lessons.filter(x => x.name == rang.name && x.selected === true && x.type == "yellow"), function(o, les) {
            sumYellowValue += les.to - les.from;
        });

        $(".ranges").append(`   <div class="range">
                                    <a target="_blank" href="https://www.fit.vut.cz/study/course/` + rang.link.split("-")[1] + `">
                                        <div class="range_name">` + rang.name + `</div>
                                    </a>
                                    <div class="range_content">
                                        <div class="range_raw">` + rang.raw + `</div>
                                        <div class="range_columns">
                                            <div class="range_column">
                                                <div class="range_column_title">Počet hodin lekce týdně:</div>` +
                                                (rang.greenLength > 0 ?
                                                    `<div class="range_row">
                                                        <div class="range_row_name">Přednášky:</div>
                                                        <div class="range_row_value">` + rang.greenLength + ` hod. týdně</div>
                                                        ` + ((sumGreenValue === rang.greenLength) ? `<div class="range_row_icon range_row_icon_check"></div>` : `<div class="range_row_icon range_row_icon_cross"></div><div class="range_row_mes_red">vybráno ` + sumGreenValue + `</div>`) + `
                                                        <div class="cleaner"></div>
                                                    </div>`
                                                : "") +
                                                (rang.blueLength > 0 ?
                                                    `<div class="range_row">
                                                        <div class="range_row_name">Cvičení:</div>
                                                        <div class="range_row_value">` + rang.blueLength + ` hod. týdně</div>
                                                        ` + ((sumBlueValue === rang.blueLength) ? `<div class="range_row_icon range_row_icon_check"></div>` : `<div class="range_row_icon range_row_icon_cross"></div><div class="range_row_mes_red">vybráno ` + sumBlueValue + `</div>`) + `
                                                        <div class="cleaner"></div>
                                                    </div>`
                                                : "") +
                                                (rang.yellowLength > 0 ?
                                                    `<div class="range_row">
                                                        <div class="range_row_name">Laboratoře:</div>
                                                        <div class="range_row_value">` + rang.yellowLength + ` hod. týdně</div>
                                                        ` + ((sumYellowValue === rang.yellowLength) ? `<div class="range_row_icon range_row_icon_check"></div>` : `<div class="range_row_icon range_row_icon_cross"></div><div class="range_row_mes_red">vybráno ` + sumYellowValue + `</div>`) + `
                                                        <div class="cleaner"></div>
                                                    </div>`
                                                : "") +
                                            `</div>
                                            <div class="range_column">
                                                <div class="range_column_title">Odhad počtu lekcí za semestr:</div>` +
                                                (rang.greenCount > 0 ?
                                                    `<div class="range_row">
                                                        <div class="range_row_name">Přednášky:</div>
                                                        <div class="range_row_value">` + rang.greenCount + `x</div>
                                                        <div class="cleaner"></div>
                                                    </div>`
                                                : "") +
                                                (rang.blueCount > 0 ?
                                                    `<div class="range_row">
                                                        <div class="range_row_name">Cvičení:</div>
                                                        <div class="range_row_value">` + rang.blueCount + `x</div>
                                                        <div class="cleaner"></div>
                                                    </div>`
                                                : "") +
                                                (rang.yellowCount > 0 ?
                                                    `<div class="range_row">
                                                        <div class="range_row_name">Laboratoře:</div>
                                                        <div class="range_row_value">` + rang.yellowCount + `x</div>
                                                        <div class="cleaner"></div>
                                                    </div>`
                                                : "") +
                                            `</div>
                                            <div class="cleaner"></div>
                                        </div>
                                    </div>
                                    <div class="cleaner"></div>
                                </div>`);
    });
} // checked

//////////////////////////////////// SAVING ////////////////////////////////////
function makeFile() {
    // Lessons
    file.custom = [];
    file.selected = [];
    file.deleted = [];
    $.each(lessons, function(i, les) {
        if(les.type === "custom") {
            file.custom.push(les);
        }
        if(les.selected) {
            file.selected.push(les.id);
        }
        if(les.deleted) {
            file.deleted.push(les.id);
        }
    });
} // checked
function restoreFile() {
    // Year
    if (file.year)
        year = file.year;
    $(".menu_years").val(year);

    // Sem
    $(".menu_sem_radio[value='" + file.sem +"']").prop("checked", true);

    // Study
    $(".menu_bit_checkbox").prop("checked", false);
    $(".menu_mit_radio").prop("checked", false);
    $.each(file.studies, function(i, stud) {
        $(".menu_bit_checkbox[value='" + stud +"']").prop("checked", true);
        $(".menu_mit_radio[value='" + stud +"']").prop("checked", true);
    });

    // Grades
    $(".menu_grade_checkbox").prop("checked", false);
    $.each(file.grades, function(i, grade) {
        $(".menu_grade_checkbox[value='" + grade +"']").prop("checked", true);
    });

    // Subjects
    $(".menu_sub_checkbox").prop("checked", false);
    $(".menu_com_column .menu_column_row").each(function(i, sub) {
        if($(sub).children(".menu_column_row_text").length > 0) {
            if(file.subjects.includes($(sub).children(".menu_column_row_text").html())) {
                $(sub).children(".menu_sub_checkbox").prop("checked", true);
            }
        }
    });
    $(".menu_opt_column .menu_column_row").each(function(i, sub) {
        if($(sub).children(".menu_column_row_text").length > 0) {
            if(file.subjects.includes($(sub).children(".menu_column_row_text").html())) {
                $(sub).children(".menu_sub_checkbox").prop("checked", true);
            }
        }
    });

    // Menu
    $(".menu_com_search_input").prop("value", ""); $(".menu_com_search_input").trigger("keyup");
    $(".menu_opt_search_input").prop("value", ""); $(".menu_opt_search_input").trigger("keyup");
    renderSubjects();
    lastLoadedSubjects = [];
    lessons = [];
    loadLessons();

    // Lessons
    $.each(file.custom, function(i, les) {
        lessons.push(les);
    });
    $.each(file.selected, function(i, les) {
        if(typeof lessons.find(x => x.id === les) != "undefined") {
            lessons.find(x => x.id === les).selected = true;
        }
    });
    $.each(file.deleted, function(i, les) {
        if(typeof lessons.find(x => x.id === les) != "undefined") {
            lessons.find(x => x.id === les).deleted = true;
        }
    });
    renderAll();
} // checked

function downloadJSON() {
    // MakeFile
    makeFile();

    // Save
    var fileJSON = JSON.stringify(file);
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(fileJSON));
    element.setAttribute('download', "schedule.json");
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
} // checked
function loadJSON() {
    // No file
    if(!$(".json_load_input")[0].files[0]) {
        $(".secs").addClass("hidden");
        $(".loading_message").removeClass("hidden");
        $(".loading_message").html("Nevybrán žádný soubor");
        $(".menu_button").prop("disabled", true);
        $(".menu_button").addClass("menu_button_disabled");

        setTimeout(function() {
            $(".loading_message").html("");
            $(".loading_message").addClass("hidden");
            $(".secs").removeClass("hidden");
            $(".menu_button").prop("disabled", false);
            $(".menu_button").removeClass("menu_button_disabled");
        }, 2000);
    }

    var reader = new FileReader();
    reader.readAsText($(".json_load_input")[0].files[0], "UTF-8");
    reader.onload = function(e) {
        try {
            file = JSON.parse(e.target.result);
            restoreFile();
            storeLocalStorage();
        } catch(e) {
            // Parse error
            $(".secs").addClass("hidden");
            $(".loading_message").removeClass("hidden");
            $(".loading_message").html("Chyba při parsování souboru");
            $(".menu_button").prop("disabled", true);
            $(".menu_button").addClass("menu_button_disabled");

            setTimeout(function() {
                $(".loading_message").html("");
                $(".loading_message").addClass("hidden");
                $(".secs").removeClass("hidden");
                $(".menu_button").prop("disabled", false);
                $(".menu_button").removeClass("menu_button_disabled");
            }, 2000);
        }
    }
    reader.onerror = function (e) {
        // Read error
        $(".secs").addClass("hidden");
        $(".loading_message").removeClass("hidden");
        $(".loading_message").html("Chyba při čtení souboru");
        $(".menu_button").prop("disabled", true);
        $(".menu_button").addClass("menu_button_disabled");

        setTimeout(function() {
            $(".loading_message").html("");
            $(".loading_message").addClass("hidden");
            $(".secs").removeClass("hidden");
            $(".menu_button").prop("disabled", false);
            $(".menu_button").removeClass("menu_button_disabled");
        }, 2000);
    }
} // checked
function exportICal() {
    var contents = "";
    var createdDatetime = getIcalDatetime(new Date);

    // iCalendar header
    contents += "BEGIN:VCALENDAR\r\n";
    contents += "VERSION:2.0\r\n";
    contents += "PRODID:-//kubosh/fitsch//NONSGML v1.0//EN\r\n";

    // Export all events from final schedule
    $.each(lessons, function(j, les) {
        // Calculate correct datetimes from les object
        var fromDatetime = getDatetimeFromHourNumber(les.from, les.day);
        var fromDatetimeIcal = getIcalDatetime(fromDatetime);
        var toDatetime = getDatetimeFromHourNumber(les.to, les.day);
        toDatetime = new Date(toDatetime.getTime() - 10 * 1000 * 60);
        var toDatetimeIcal = getIcalDatetime(toDatetime);

        var typeString = getTypeString(les.type);

        // Event header
        contents += "BEGIN:VEVENT\r\n";
        contents += "UID:" + createdDatetime + "-" + les.id + "\r\n";
        contents += "DTSTAMP:" + createdDatetime + "\r\n";

        // Datetimes
        contents += "DTSTART:" + fromDatetimeIcal + "\r\n";
        contents += "DTEND:" + toDatetimeIcal + "\r\n";
        contents += "RRULE:FREQ=WEEKLY\r\n";

        // Additional info
        contents += "SUMMARY:" + les.name + " " + typeString + "\r\n";
        contents += "LOCATION:" + les.rooms.join(" ") + "\r\n";
        contents += "URL:https://www.fit.vut.cz/study/course/" + les.url + "\r\n";

        // Event footer
        contents += "END:VEVENT\r\n";
    })

    // iCalendar footer
    contents += "END:VCALENDAR";

    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(contents));
    element.setAttribute('download', "schedule.ics");
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
} // checked
function storeLocalStorage() {
    // Makefile
    makeFile();

    // Store
    localStorage.setItem("schedule", JSON.stringify(file));
} // checked
function loadLocalStorage() {
    if(localStorage.getItem("schedule") != null) {
        // Load
        try {
            file = JSON.parse(localStorage.getItem("schedule"));
        } catch {}

        // Restore
        restoreFile();
    }
} // checked

//////////////////////////////////// Helpers ///////////////////////////////////
function parseLinkforLoadPHP(link) {
    var linkArray = link.split("/");
    linkArray = linkArray.filter(x => x != "");
    return linkArray[linkArray.length - 2] + "-" + linkArray[linkArray.length - 1];
} // checked
function parseDay(day) {
    if(day === "Po") {
        return 0;
    } else if(day === "Út") {
        return 1;
    } else if(day === "St") {
        return 2;
    } else if(day === "Čt") {
        return 3;
    } else if(day === "Pá") {
        return 4;
    }
} // checked
function parseWeek(week) {
    week = week.replace("výuky", "");
    week = week.replaceAll(",", "");
    week = week.trim();
    return week;
} // checked
function parseTimeFrom(time) {
    var hours = +time.split(":")[0];
    return hours - 7;
} // checked
function parseTimeTo(time) {
    var hours = +time.split(":")[0] + 1;
    return hours - 7;
} // checked
function doLessonsCollide(a, b, x, y) {
    if(x > a && x < b) {
        return true;
    }
    if(y > a && y < b) {
        return true;
    }
    if(a > x && a < y) {
        return true;
    }
    if(b > x && b < y) {
        return true;
    }
    if(a == x && b == y) {
        return true;
    }
    return false;
} // checked
function makeHash(string) {
    var hash = 0, i, chr;

    if(string.length === 0) {
        return hash;
    }
    for(i = 0; i < string.length; i++) {
        chr   = string.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0;
    }

    if(Number.isInteger(hash)) {
        hash = Math.abs(hash);
    }
    return hash.toString();
}; // checked
function padNumber(number) {
    return (number < 10) ? ("0" + number) : number;
} // checked
function getIcalDatetime(date) {
    var buffer = "";
    buffer += date.getUTCFullYear();
    buffer += padNumber(date.getUTCMonth() + 1);
    buffer += padNumber(date.getUTCDate());
    buffer += "T";
    buffer += padNumber(date.getUTCHours());
    buffer += padNumber(date.getUTCMinutes());
    buffer += padNumber(date.getUTCSeconds());
    buffer += "Z";
    return buffer;
} // checked
function getDatetimeFromHourNumber(hour, dayIndex) {
    hour += 7; // Convert to actual hour

    var date = new Date;
    var currentDay = date.getDay();
    var distance = (dayIndex + 1) - currentDay;
    date.setDate(date.getDate() + distance);
    date.setHours(hour, 0, 0, 0);

    return date;
} // checked
function getTypeString(type) {
    switch(type) {
        case "green":
            return "Přednáška";
        case "blue":
            return "Cvičení";
        case "yellow":
            return "Laboratoř";
        case "custom":
            return "Vlastní hodina";
        default:
            return "Jiný typ";
    }
} // checked
