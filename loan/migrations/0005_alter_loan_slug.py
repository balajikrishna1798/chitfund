# Generated by Django 4.2 on 2023-05-11 07:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('loan', '0004_alter_loan_slug'),
    ]

    operations = [
        migrations.AlterField(
            model_name='loan',
            name='slug',
            field=models.SlugField(blank=True, max_length=10, null=True, unique=True),
        ),
    ]