package com.vaktim.ezan

import android.app.AlarmManager
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.SystemClock
import android.view.View
import android.widget.RemoteViews
import org.json.JSONArray
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

class VaktimWidget : AppWidgetProvider() {

    private val action = "com.vaktim.ezan.WIDGET_REFRESH"

    private fun alarmIntent(context: Context): PendingIntent {
        return PendingIntent.getBroadcast(
            context, 701,
            Intent(context, VaktimWidget::class.java).setAction(action),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == action) {
            val manager = AppWidgetManager.getInstance(context)
            val ids = manager.getAppWidgetIds(
                ComponentName(context, VaktimWidget::class.java)
            )
            if (ids.isNotEmpty()) onUpdate(context, manager, ids)
        }
    }

    override fun onDisabled(context: Context) {
        val alarm = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        alarm.cancel(alarmIntent(context))
        super.onDisabled(context)
    }

    override fun onUpdate(
        context: Context,
        manager: AppWidgetManager,
        widgetIds: IntArray
    ) {
        val prefs = context.getSharedPreferences(
            "vaktim_widget", Context.MODE_PRIVATE
        )
        val city = prefs.getString("city", "Konum bekleniyor")
        val now = System.currentTimeMillis()

        val rows = mutableListOf<Pair<String, Long>>()

        try {
            val json = JSONArray(prefs.getString("schedule", "[]") ?: "[]")
            for (i in 0 until json.length()) {
                val item = json.getJSONObject(i)
                rows.add(item.getString("label") to item.getLong("time"))
            }
        } catch (e: Exception) {}

        rows.sortBy { it.second }

        val next = rows.firstOrNull { it.second > now }
        val clock = SimpleDateFormat("HH:mm", Locale("tr", "TR"))
        val day = SimpleDateFormat("yyyyMMdd", Locale.US)

        val today = rows.filter {
            day.format(Date(it.second)) == day.format(Date(now))
        }

        val labels = listOf("İmsak", "Güneş", "Öğle", "İkindi", "Akşam", "Yatsı")

        val viewIds = intArrayOf(
            R.id.widget_vakit_0,
            R.id.widget_vakit_1,
            R.id.widget_vakit_2,
            R.id.widget_vakit_3,
            R.id.widget_vakit_4,
            R.id.widget_vakit_5
        )

        val openApp = PendingIntent.getActivity(
            context, 0,
            Intent(context, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val openSettings = PendingIntent.getActivity(
            context, 702,
            Intent(context, MainActivity::class.java).apply {
                action = Intent.ACTION_VIEW
                data = android.net.Uri.parse("vaktim://ayarlar")
                flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
            },
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        for (id in widgetIds) {
            val views = RemoteViews(context.packageName, R.layout.vaktim_widget)

            views.setTextViewText(R.id.widget_city, city)

            if (next != null) {
                views.setTextViewText(R.id.widget_prayer, next.first)
                views.setTextViewText(R.id.widget_countdown, clock.format(Date(next.second)))

                views.setViewVisibility(R.id.widget_timer, View.VISIBLE)
                views.setChronometerCountDown(R.id.widget_timer, true)
                views.setChronometer(
                    R.id.widget_timer,
                    SystemClock.elapsedRealtime() + next.second - now,
                    "Kalan: %s",
                    true
                )
            } else {
                views.setTextViewText(R.id.widget_prayer, "Uygulamayı açın")
                views.setTextViewText(R.id.widget_countdown, "--:--")
                views.setViewVisibility(R.id.widget_timer, View.GONE)
            }

            for (i in labels.indices) {
                val entry = today.firstOrNull { it.first == labels[i] }
                val time = if (entry != null) clock.format(Date(entry.second)) else "--:--"
                views.setTextViewText(viewIds[i], labels[i] + "\n" + time)
            }

            views.setOnClickPendingIntent(R.id.widget_title, openApp)
            views.setOnClickPendingIntent(R.id.widget_settings, openSettings)

            manager.updateAppWidget(id, views)
        }

        val alarm = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

        if (next != null && widgetIds.isNotEmpty()) {
            val midnight = Calendar.getInstance().apply {
                add(Calendar.DAY_OF_YEAR, 1)
                set(Calendar.HOUR_OF_DAY, 0)
                set(Calendar.MINUTE, 0)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
            }.timeInMillis

            alarm.setAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,
                minOf(next.second, midnight) + 1000,
                alarmIntent(context)
            )
        } else {
            alarm.cancel(alarmIntent(context))
        }
    }
}
