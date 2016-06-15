<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<c:set var="ctx" value="${pageContext.request.contextPath}" />
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
</head>
<body>
	<div class="tabbable tabbable-custom">
		<ul class="nav nav-tabs" data-active="${param._tab_active}">
			<li class="tools pull-right"><a href="javascript:;" class="btn default reload"><i class="fa fa-refresh"></i></a></li>
			<li><a data-toggle="tab" href="${ctx}/admin/sys/config-property/edit?id=${id}">Basic Information</a></li>
			<li><a data-toggle="tab" data-tab-disabled="${entity.isNew()}"
				href="${ctx}/admin/sys/config-property/revision?id=${id}">Change History</a></li>
		</ul>
	</div>
</body>
</html>