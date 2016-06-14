var Global = function() {
	var userProfileParamsCache;
	var $singleFileUploadForm = $("#singleFileUploadForm");
	var $singleFileUploadTrigger;
	var vuuid = 1;
	return {
		isMobile : function() {
			var u = navigator.userAgent;
			return !!u.match(/AppleWebKit.*Mobile.*/)
					|| !!u.match(/AppleWebKit/)
		},
		isIELowerVersion : function() {
			var isIE = !!window.ActiveXObject;
			return isIE
		},
		bindBtnSendSmsCode : function() {
			$("body")
					.on(
							"click",
							".btn-send-sms-code",
							function() {
								var timer;
								var $sendCode = $(this);
								if ($sendCode.attr("disabled")) {
									return
								}
								var $mobile = $sendCode.closest("form").find(
										"input[name='"
												+ $sendCode
														.attr("data-mobile-el")
												+ "']");
								if ($mobile.valid()) {
									var captchaImgId = "ModalView_captchaImg";
									var captchaImgTemplete = '<div class="model-background" style="z-index: 1050; display: block;" tabindex="-1"></div><div class="text-center" style="position: fixed; top: 30%; right: 0; left: 0; z-index: 1051;"><div class="modal-dialog"><div class="modal-content" style="color: #000000; background: #ffffff!important"><div class="modal-header"><h4 class="modal-title">验证码</h4></div><div class="modal-body"><div class="row"><div class="col-md-12"><div class="input-group"><input class="form-control captcha-text" type="text" autocomplete="off" placeholder="请输入验证码" name="captcha" required="true" data-msg-required="请填写验证码" /><span class="input-group-btn" style="cursor: pointer;"> <img alt="验证码" class="captcha-img" src="'
											+ WEB_ROOT
											+ '/assets/img/captcha_placeholder.jpg" title="看不清？点击刷新" /></span></div></div></div></div><div class="modal-footer"><button type="button" class="btn btn-primary btn-block">确定</button></div></div></div></div>';
									$(document.body).append(
											"<div id='" + captchaImgId + "'>"
													+ captchaImgTemplete
													+ "</div>");
									var $modalView = $("#" + captchaImgId)
											.find("div");
									var $captchaImage = $modalView
											.find(".captcha-img");
									$captchaImage.click();
									var captcha = "";
									$modalView
											.find("button")
											.unbind()
											.bind(
													"click",
													function(e) {
														var $captcha = $modalView
																.find('input[name="captcha"]');
														captcha = $captcha
																.val();
														console.log(captcha);
														if (captcha == "") {
															alert("验证码不能为空");
															return
														} else {
															console
																	.log("come in...");
															$sendCode.attr(
																	"disabled",
																	true);
															$sendCode
																	.html("正在发送...");
															$sendCode
																	.closest(
																			".form-group")
																	.find(
																			":text:first")
																	.focus()
																	.select();
															var open = $sendCode
																	.attr("data-open");
															$
																	.ajax({
																		url : WEB_ROOT
																				+ "/"
																				+ (open
																						&& open != "false" ? "send"
																						: "user")
																				+ "-sms-code/"
																				+ $mobile
																						.val()
																				+ "?code="
																				+ captcha,
																		dataType : "json",
																		method : "get",
																		success : function(
																				response) {
																			if (response.type == "success") {
																				$(
																						"#"
																								+ captchaImgId)
																						.remove();
																				$sendCode
																						.html("<i>已发送<span class='small'>(<span class='count'> 60 </span>秒后可重发)</span></i>");
																				timer = setInterval(
																						function() {
																							var count = $sendCode
																									.find(
																											".count")
																									.html();
																							if (count <= 0) {
																								$sendCode
																										.attr(
																												"disabled",
																												false);
																								$sendCode
																										.html("获取验证码");
																								clearInterval(timer)
																							} else {
																								count = Number(count) - 1;
																								$sendCode
																										.html("<i>已发送<span class='small'>(<span class='count'> "
																												+ count
																												+ " </span>秒后可重发)</span></i>")
																							}
																						},
																						1000)
																			} else {
																				alert(response.message);
																				$sendCode
																						.attr(
																								"disabled",
																								false);
																				$sendCode
																						.html("获取验证码");
																				$captchaImage
																						.click()
																			}
																		}
																	})
														}
													})
								}
							})
		},
		bindTableInfiniteScroll : function() {
			var infiniteScrolHandler = function() {
				var $tables = $("table.table-infinite-scroll");
				if ($tables.size() > 0
						&& $(this).scrollTop() + $(window).height() + 20 >= $(
								document).height()) {
					$tables.each(function() {
						var $table = $(this);
						var loading = $table.attr("data-scroll-loading");
						if (loading) {
							return
						}
						$table.attr("data-scroll-loading", true);
						var $target = $table.children("tbody");
						var page = $table.attr("data-scroll-page");
						if (page) {
							if (page == "-1") {
								infiniteScrolProcessing = false;
								return
							}
							page = Number(page) + 1
						} else {
							if ($target.is(":empty")) {
								page = 1
							} else {
								page = 2
							}
						}
						$table.attr("data-scroll-page", page);
						var url = $target.attr("data-url");
						url = Util.AddOrReplaceUrlParameter(url, "page", page);
						App.blockUI($target);
						$.ajax({
							type : "GET",
							cache : false,
							url : url,
							dataType : "html",
							headers : {
								decorator : "body"
							},
							success : function(res) {
								if ($.trim(res) == "") {
									$table.attr("data-scroll-page", "-1")
								}
								$target.append(res);
								Page.initAjaxBeforeShow($target);
								FormValidation.initAjax($target);
								Page.initAjaxAfterShow($target);
								App.unblockUI($target);
								$table.removeAttr("data-scroll-loading")
							},
							error : function(xhr, ajaxOptions, thrownError) {
								$content.html("<h4>页面内容加载失败</h4>"
										+ xhr.responseText);
								App.unblockUI($target)
							},
							statusCode : {
								403 : function() {
									Global.notify("error", "URL: " + url,
											"未授权访问")
								},
								404 : function() {
									Global.notify("error", "页面未找到：" + url
											+ "，请联系管理员", "请求资源未找到")
								}
							}
						})
					})
				}
			};
			$(window).on("mousewheel", function(event) {
				infiniteScrolHandler.call(this)
			});
			$(window).on("scroll", function(event) {
				infiniteScrolHandler.call(this)
			})
		},
		bindExtBootstrapTab : function() {
			$(document).off("click.tab.data-api");
			$(document)
					.on(
							"click.tab.data-api",
							'[data-toggle="tab"], [data-toggle="pill"]',
							function(e) {
								var $a = $(this);
								var ajax = $a.attr("data-ajax");
								if (ajax == "false") {
									return true
								}
								if ($a.hasClass("disabled")
										|| $a.attr("data-tab-disabled") == "true") {
									return false
								}
								var href = $a.attr("data-url") ? $a
										.attr("data-url") : $a.attr("href");
								href = $.trim(href);
								if (!Util.startWith(href, "#")) {
									$a.attr("data-url", href);
									var contentId = "tab_content_"
											+ Util.hashCode(href);
									$a.attr("href", "#" + contentId);
									var $navParent = $a.closest("ul.nav")
											.parent();
									var $contents = $navParent
											.find(" > div.tab-content");
									if ($contents.length == 0) {
										$contents = $(
												'<div class="tab-content">')
												.appendTo($navParent)
									}
									var $content = $contents.find("div#"
											+ contentId);
									if ($content.length == 0) {
										$content = $(
												'<div id="'
														+ contentId
														+ '" class="tab-pane active">')
												.appendTo($contents)
									}
									if ($content.is(":empty")) {
										$content
												.ajaxGetUrl(
														href,
														function() {
															$content
																	.append('<div style="clear:both"></div>');
															$content
																	.find(
																			".nav > li.active > a")
																	.click()
														})
									}
								}
								$(this).tab("show");
								var $navTabs = $(this).closest(".nav-tabs");
								var idx = $navTabs.find("li:not(.tools)")
										.index($(this).parent("li"));
								$navTabs.attr("data-active", idx);
								if ($.jgrid) {
									Grid.refreshWidth()
								}
								e.preventDefault()
							})
		},
		bindModalAjaxify : function() {
			jQuery("body").on("click",
					'a[data-toggle="modal-ajaxify"],a[target="modal-ajaxify"]',
					function(e) {
						e.preventDefault();
						$(this).popupDialog()
					})
		},
		bindCaptchaCode : function() {
			jQuery("body")
					.on(
							"click",
							".captcha-img",
							function(e) {
								$(".captcha-img")
										.each(
												function() {
													$(this)
															.attr(
																	"src",
																	WEB_ROOT
																			+ "/assets/img/captcha_placeholder.jpg")
												});
								$(this).attr(
										"src",
										WEB_ROOT + "/pub/jcaptcha.servlet?_="
												+ new Date().getTime());
								var $captchaText = $(this).closest(
										".form-group").find(".captcha-text");
								$captchaText.focus();
								$captchaText.select();
								return false
							});
			jQuery("body").on(
					"focus",
					".captcha-text",
					function(e) {
						var $captchaImg = $(this).closest(".form-group").find(
								".captcha-img");
						if ($captchaImg.attr("src") == WEB_ROOT
								+ "/assets/img/captcha_placeholder.jpg") {
							$captchaImg.click()
						}
					})
		},
		bindBtnPostUrl : function() {
			jQuery("body")
					.on(
							"click",
							".btn-post-url",
							function(e) {
								e.preventDefault();
								var $btn = $(this);
								var url = null;
								if ($btn.is("button")) {
									url = $btn.attr("data-url")
								} else {
									if ($btn.is("a")) {
										url = $btn.attr("href")
									}
								}
								var confirmMsg = $btn.attr("data-confirm");
								var prompt = $btn.attr("data-prompt");
								if (prompt) {
									confirmMsg = false;
									var promptDone = $btn
											.attr("data-prompt-done");
									if (promptDone == undefined) {
										bootbox
												.prompt(
														prompt,
														function(result) {
															if (result === null) {
															} else {
																if ($
																		.trim(result) == "") {
																	alert(prompt);
																	return false
																} else {
																	$btn
																			.attr(
																					"data-prompt-done",
																					true);
																	$btn
																			.attr(
																					"data-url",
																					Util
																							.AddOrReplaceUrlParameter(
																									url,
																									"prompt",
																									result));
																	$btn
																			.click()
																}
															}
															return
														});
										return
									}
								}
								$btn
										.ajaxPostURL({
											url : url,
											success : function(response) {
												var success = $btn
														.attr("data-post-success");
												if (success) {
													eval(success);
													return
												}
												var reload = $btn
														.attr("data-post-reload");
												if (reload) {
													if (reload == "page") {
														window.location
																.reload()
													} else {
														if (reload == "container") {
															var $container = $btn
																	.closest(".ajax-get-container");
															$container
																	.ajaxGetUrl($container
																			.attr("data-url"))
														} else {
															$(reload)
																	.each(
																			function() {
																				$(
																						this)
																						.ajaxGetUrl(
																								$(
																										this)
																										.attr(
																												"data-url"))
																			})
														}
													}
												}
											},
											confirmMsg : confirmMsg
										})
							})
		},
		triggerSingleFileUpload : function($el) {
			$singleFileUploadTrigger = $el;
			var url = $el.attr("data-url");
			if (url == undefined) {
				url = WEB_ROOT + "/w/file/upload/single"
			}
			var dataZoomoutTo = $el.attr("data-zoomout-to");
			if (dataZoomoutTo > 0) {
				$(
						'<input type="hidden" name="data-zoomout-to" value="'
								+ dataZoomoutTo + '"/>').insertAfter(
						$("input[name='fileUpload']", $singleFileUploadForm))
			}
			$singleFileUploadForm.attr("action", url);
			$("input[name='fileUpload']", $singleFileUploadForm).click()
		},
		init : function() {
			if (bootbox) {
				bootbox.setDefaults({
					locale : "zh_CN"
				})
			}
			(function(a) {
				(jQuery.browser = jQuery.browser || {}).mobile = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i
						.test(a)
						|| /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i
								.test(a.substr(0, 4))
			})(navigator.userAgent || navigator.vendor || window.opera);
			$("body").on("click", ".header a[data-nav-id]", function() {
				var $a = $(this);
				$.cookie("data-nav-id", $a.attr("data-nav-id"), {
					path : "/"
				})
			});
			var navId = $.cookie("data-nav-id");
			if (navId && navId != "none") {
				$(".header a[data-nav-id='" + navId + "']").parent("li")
						.addClass("active")
			}
			toastr.options = {
				tapToDismiss : false,
				closeButton : true,
				positionClass : "toast-bottom-right",
				extendedTimeOut : 600000
			};
			if ($.fn.daterangepicker) {
				$.fn.daterangepicker.defaults = {
					dateLimit : {
						days : 365
					},
					showDropdowns : true,
					showWeekNumbers : true,
					timePicker : false,
					timePickerIncrement : 1,
					timePicker12Hour : true,
					buttonClasses : [ "btn" ],
					applyClass : "green",
					cancelClass : "default",
					format : "YYYY-MM-DD",
					separator : " ~ ",
					locale : {
						applyLabel : "确定",
						fromLabel : "从",
						toLabel : "到",
						customRangeLabel : "自由选取",
						daysOfWeek : [ "日", "一", "二", "三", "四", "五", "六" ],
						monthNames : [ "1月", "2月", "3月", "4月", "5月", "6月",
								"7月", "8月", "9月", "10月", "11月", "12月" ],
						firstDay : 1
					}
				}
			}
			var $menuContainer = $(".page-site .page-sidebar-menu");
			if ($menuContainer.size() > 0) {
				$.address.change(function(event) {
					var hash = event.value;
					if (hash == "/") {
						$a = $menuContainer.find("li.menu > a[rel]").first()
					} else {
						var $a = $menuContainer.find(
								'li.menu > a[rel="address:' + event.value
										+ '"]').first();
						if ($a.size() == 0) {
							$a = $menuContainer.find(
									'li.menu > a[rel^="address:' + event.value
											+ '"]').first()
						}
					}
					if ($a.size() == 0) {
						$(".page-menu-content").ajaxGetUrl(
								WEB_ROOT + event.value)
					} else {
						var href = WEB_ROOT
								+ $
										.trim($a.attr("rel").replace(
												"address:", ""));
						$(".page-menu-content").ajaxGetUrl(href);
						var $ali = $(".page-sidebar-menu").find("li");
						$ali.removeClass("active").removeClass("open");
						var $li = $a.parent("li");
						$li.addClass("active");
						if (!$li.parent().hasClass("page-sidebar-menu")) {
							var $ul = $li.closest("ul.sub-menu");
							while ($ul.size() > 0) {
								$ul.show();
								var $pli = $ul.parent("li");
								$pli.addClass("open");
								$pli.find(" > a > i.fa").removeClass(
										"fa-caret-right");
								$pli.find(" > a > i.fa").addClass(
										"fa-caret-down");
								$ul = $pli.closest("ul.sub-menu")
							}
						}
					}
				});
				$menuContainer.on("click", "li > a:not([rel])", function() {
					var $li = $(this).parent();
					if ($li.hasClass("open")) {
						$li.removeClass("open");
						$li.find(" > a > i.fa").removeClass("fa-caret-down");
						$li.find(" > a > i.fa").addClass("fa-caret-right");
						$li.children("ul.sub-menu").hide()
					} else {
						$li.addClass("open");
						$li.find(" > a > i.fa").removeClass("fa-caret-right");
						$li.find(" > a > i.fa").addClass("fa-caret-down");
						$li.children("ul.sub-menu").show()
					}
				})
			}
			$("body")
					.on(
							"click",
							".paging_bootstrap a",
							function() {
								var $a = $(this);
								var $pager = $a.closest(".paging_bootstrap");
								if ($pager.attr("target") == undefined
										|| $pager.attr("target") == "ajax-get-container") {
									var $container = $a
											.closest(".ajax-get-container");
									var url = $container.attr("data-url");
									$container.ajaxGetUrl(Util
											.AddOrReplaceUrlParameter(url,
													"page", $a.attr("page")))
								} else {
									var $target = $($pager.attr("target"));
									if ($target.is("form")) {
										var $pageNo = $target
												.find("input[name='page']");
										if ($pageNo.size() == 0) {
											$pageNo = $(
													"<input type='hidden' name='page'/>")
													.appendTo($target)
										}
										$pageNo.val($a.attr("page"));
										$target.submit();
										return false
									}
								}
							});
			Global.bindBtnSendSmsCode();
			Global.bindTableInfiniteScroll();
			Global.bindExtBootstrapTab();
			Global.bindModalAjaxify();
			Global.bindCaptchaCode();
			Global.bindBtnPostUrl();
			jQuery("body").on("dblclick", ".portlet-title", function(e) {
				$(this).find(".tools .collapse,.tools .expand").click()
			});
			jQuery("body")
					.on(
							"click",
							'[data-toggle="buttons"] > label.btn',
							function(e) {
								var $btn = $(this);
								if ($btn.is(".clear")) {
									$(this).parent().find(
											"> label.btn:not(.clear)")
											.removeClass("active");
									$(this)
											.parent()
											.find(
													"> label.btn:not(.clear) > input[type='checkbox']")
											.attr("checked", false)
								} else {
									$(this).parent().find("> label.btn.clear")
											.removeClass("active")
								}
							});
			jQuery("body").on(
					"click",
					'[data-toggle="buttons"] > label.btn',
					function(e) {
						$(this).parent().find("> label.clear").removeClass(
								"active")
					});
			jQuery("body").on("click", ".portlet-title > .tools > .reload",
					function(e) {
						e.preventDefault();
						var $ajaxify = $(this).closest(".ajaxify");
						if ($ajaxify.attr("data-url")) {
							var url = $ajaxify.attr("data-url");
							$ajaxify.ajaxGetUrl(url)
						}
					});
			jQuery("body").on("click", "[data-reload]", function(e) {
				var $btn = $(this);
				var target = $btn.attr("data-reload");
				if ("container" == target) {
					var $container = $btn.closest(".ajax-get-container");
					$container.ajaxGetUrl($container.attr("data-url"));
					return
				} else {
					if ("location" == target) {
						window.location.reload()
					}
				}
			});
			jQuery("body").on(
					"click",
					".btn-file-upload",
					function(e) {
						var $btn = $(this);
						var id = $btn.attr("id");
						if (id == undefined) {
							id = "__file_img_" + new Date().getTime();
							$btn.attr("id", id)
						}
						e.preventDefault();
						$btn.popupDialog({
							url : WEB_ROOT + "/w/image/upload?el=" + id + "&_"
									+ new Date().getTime(),
							title : "图片上传",
							size : 600
						})
					});
			$("input[name='fileUpload']", $singleFileUploadForm)
					.change(
							function() {
								var $b = $singleFileUploadTrigger.parent();
								App.blockUI($b);
								$singleFileUploadForm
										.ajaxSubmit({
											dataType : "json",
											method : "post",
											success : function(response) {
												if (response.type == "success") {
													var src = response.data;
													$singleFileUploadTrigger
															.val(src);
													var $form = $singleFileUploadTrigger
															.closest("form");
													$form
															.data("validator")
															.element(
																	$singleFileUploadTrigger);
													var name = $singleFileUploadTrigger
															.attr("name");
													var $img = $singleFileUploadTrigger
															.closest(
																	".form-group")
															.find(
																	"img.image-display[data-to='"
																			+ name
																			+ "']");
													if ($img.size() > 0) {
														if (READ_FILE_URL_PREFIX) {
															src = READ_FILE_URL_PREFIX
																	+ src
														}
														$img.attr("src", src)
													}
													var dataGridReload = $singleFileUploadTrigger
															.attr("data-grid-reload");
													if (dataGridReload) {
														$(dataGridReload)
																.jqGrid(
																		"setGridParam",
																		{
																			datatype : "json"
																		})
																.trigger(
																		"reloadGrid")
													}
													App.unblockUI($b)
												} else {
													Global.notify("error",
															response.message);
													App.unblockUI($b)
												}
											},
											error : function(xhr, e, status) {
												Global.notify("error",
														"文件上传处理异常，请联系管理员");
												App.unblockUI($b)
											}
										});
								return false
							});
			var $messageCountToRead = $("#message-count-alert");
			if ($messageCountToRead.size() > 0) {
				$.ajax({
					dataType : "json",
					method : "get",
					url : WEB_ROOT + "/w/user/notify-message-count",
					success : function(response) {
						var i = response.data;
						if (i > 0) {
							$messageCountToRead.html("(" + i + ")").show()
						} else {
							$messageCountToRead.html(0).hide()
						}
					}
				})
			}
			$("body").on("show.bs.modal", function(e) {
				$(e.target).find(".alert-edit-success").remove()
			});
			$.fn.modal.Constructor.prototype.enforceFocus = function() {
				var that = this;
				$(document).on("focusin.modal", function(e) {
					if ($(e.target).hasClass("select2-input")) {
						return true
					}
				})
			};
			$("body > .page-container-outer").css(
					"min-height",
					$(window).height() - $("body > .header").outerHeight()
							- $("body > .footer").outerHeight() - 55);
			$("body > .footer").show();
			$(document)
					.on(
							"mousedown",
							function(e) {
								var $preview = $("#image-preview");
								if ($preview.size() > 0) {
									if (!($preview.is(e.target) || $preview
											.find(e.target).length)) {
										$preview.hide()
									}
								}
								var $btnProfileParam = $("#btn-profile-param");
								if ($btnProfileParam.size() > 0) {
									if (!($btnProfileParam.is(e.target) || $btnProfileParam
											.find(e.target).length)) {
										$btnProfileParam.hide()
									}
								}
							})
		},
		showModel : function(message, opt) {
			var options = $.extend({
				icon : "notice.png",
				title : "提示",
				action : WEB_ROOT + "/w",
				button : "返回首页"
			}, opt);
			var modaltemplate = '<div class="model-background" style="z-index: 1050;" tabindex="-1"></div><div class="text-center" style="position: fixed; top: 35%; right: 0; left: 0; z-index: 1051;"><div class="modal-dialog"><div class="modal-content ui-draggable"><div class="modal-body"><h1 class="col-md-12" style="color:white;"><img src="'
					+ WEB_ROOT
					+ "/assets/w/app/images/"
					+ options.icon
					+ '"> '
					+ options.title
					+ '</h1><div class="col-md-12 margin-top-20">MESSAGE</div><div class="col-md-12 margin-top-20 margin-bottom-20"><a href="javascript:;" close="#ModalView_1" class="btn btn-action confirm-btn ok-ModalView_1" style="min-width:120px;">'
					+ options.button + "</a></div></div></div></div></div>";
			var id = "ModalView_" + (vuuid++);
			message = (message.indexOf("modal-body") > 0) ? message
					: '	<div class="modal-body" style="color:white;">'
							+ message + "</div>";
			message = message.replace(/data-dismiss="modal"/gi, "close='#" + id
					+ "'");
			$(document.body).append(
					"<div id='"
							+ id
							+ "'>"
							+ modaltemplate.replace(/modaltemplate/gi, id)
									.replace(/z-index: 105/gi,
											"z-index: " + (99 + vuuid))
									.replace("MESSAGE", message) + "</div>");
			var $modalView = $("#" + id).find("div");
			$modalView.find(".ok-" + id).unbind().bind("click", function(e) {
				switch (typeof options.action) {
				case "string":
					location.href = options.action;
					break;
				case "function":
					eval(options.action);
					break
				}
				$("#" + id).remove()
			});
			$modalView.show()
		},
		notify : function(type, message, title) {
			if (type == "error" || type == "failure") {
				type = "error";
				toastr.options.timeOut = 10000;
				toastr.options.positionClass = "toast-bottom-center"
			} else {
				toastr.options.timeOut = 2000;
				toastr.options.positionClass = "toast-bottom-right"
			}
			if (title == undefined) {
				title = ""
			}
			if (message == null || message == undefined || message == "") {
				message = "操作已处理完成"
			}
			toastr[type](message, title)
		}
	}
}();